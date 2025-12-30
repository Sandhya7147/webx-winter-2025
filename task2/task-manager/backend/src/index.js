const express = require('express');
const cors =require('cors');
const path = require('path');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { Client } = require('pg');

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  })
);
app.use(express.json());

const envPath = path.resolve(__dirname, '../../../../.env');
require('dotenv').config({ path: envPath });
const port = process.env.PORT || 5000;


const client = new Client();

async function startConnection(){
    try{
        await client.connect();
        const res = await client.query('SELECT current_database()');
        console.log("CONNECTED TO DATABASE:", res.rows[0].current_database);
    }catch(error){
        console.error("Failed to connect:", error.message);
    }
}

startConnection();

//middleware
function authenticateToken(req,res,next){
  const authHeader = req.headers['authorization'];
  const token=authHeader && authHeader.split(' ')[1];
  if (token==null) return res.sendStatus(401);
  
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  })
}

app.post('/tasks/post', authenticateToken, async (req, res) => {
  const task=req.body.title;
  const user_id=req.user.id;
  const queryText = 'INSERT INTO tasks(user_id, title) VALUES($1, $2) RETURNING *';
  const values = [user_id, task];
  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Row added:", resdb.rows[0]);
    res.status(201).json(resdb.rows[0]);
  }catch(error){
    console.error(`inside post query${error.message}`);
  }
});

app.post('/login',async (req, res) => {
  const username=req.body.username;
  const pwd=req.body.pwd;

  const queryText = 'SELECT * FROM users WHERE username=$1';
  const values = [username];

  try{    
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Rows:", resdb.rows);
    if(resdb.rows.length===0){
      throw new Error('404: Username Not Found');
    }
  
    if(!(await bcrypt.compare(pwd,resdb.rows[0].password_hash))){
      throw new Error('401: Unauthorized');
    }

    const row=resdb.rows[0];
    const user={id:row.id, username:row.username, isAdmin:username==='admin'}
    const accessToken= jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

    res.status(201).json({
      accessToken:accessToken,
      isAdmin:user.isAdmin,
      username:row.username
    });
  }catch(error){

    console.error(`inside login post query${error.message}`);
    if(error.message.includes('404')){
      res.status(404).json({'message':'404: Not Found'});
    }
    else if(error.message.includes('401')){
      res.status(401).json({'message':'401: Unauthorized'});
    }
  }
});

app.post('/signup',async (req, res) => {
  const username=req.body.username;
  const pwd=req.body.pwd;

  const queryText = 'INSERT INTO users(username,password_hash) VALUES($1,$2)';
  try{
    const pwd_hash = await bcrypt.hash(pwd,10);
    console.log(pwd_hash);
    const values = [username,pwd_hash];

    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Rows:", resdb.rows);
    res.status(201).json({'message':'201: Success'});
  }catch(error){
    console.error(`inside signup post query: ${error.message}`);
    if(error.message.includes('duplicate key value')){
      res.status(409).json({'message':'409: Conflict'})
    }
  }
});

app.get('/tasks/get',authenticateToken,async (req,res)=>{
  const user_id=req.user.id;
  const queryText = 'SELECT * FROM tasks WHERE user_id=$1 ORDER BY id ASC';
  const values = [user_id];
  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Rows retrieved", resdb.rows);
    res.status(200).json(resdb.rows);
  }catch(error){
    console.error(`inside get query${error.message}`);
  }

});

app.delete('/tasks/:id/delete', authenticateToken, async (req, res) => {
  const id=req.params.id;
  const user_id=req.user.id;
  const isAdmin = req.user.isAdmin;
  let queryText;
  let values;
  //both admin and user delete endpoint
  if (isAdmin) {
    queryText = 'DELETE FROM tasks WHERE id = $1 RETURNING *';
    values = [id];
  }else {
    queryText = 'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *';
    values = [id, user_id];
  }

  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Row deleted", resdb.rows[0]);
    res.status(200).json(resdb.rows[0]);
  }catch(error){
    console.error(`inside delete query${error.message}`);
  }
});

app.patch('/tasks/patch', authenticateToken, async (req, res) => {
  const id=req.body.id;
  const user_id=req.user.id;
  const completed=req.body.completed;
  const isAdmin = req.user.isAdmin;
   
  let queryText;
  let values; 
  // both user and admin patch endpoint
  if (isAdmin) {
    queryText = 'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *';
    values = [completed,id];
  }else {
    queryText = 'UPDATE tasks SET completed = $1 WHERE id = $2 AND user_id = $3 RETURNING *';
    values = [completed, id, user_id]; 
  }
  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Row modified", resdb.rows[0]);
    res.status(200).json(resdb.rows[0]);
  }catch(error){
    console.error(`inside patch query${error.message}`);
  }
});

app.get('/admin/tasks/get',authenticateToken,async (req,res)=>{
  const isAdmin=req.user.isAdmin;
  const queryText = `
  SELECT 
    tasks.id, 
    tasks.title, 
    tasks.completed, 
    users.username 
  FROM tasks 
  JOIN users ON tasks.user_id = users.id 
  ORDER BY tasks.user_id ASC, tasks.id ASC
`;
  try{
    if(isAdmin){
      const resdb = await client.query(queryText);
      console.log(resdb);
      console.log("Rows retrieved", resdb.rows);
      res.status(200).json(resdb.rows);
    }
    else{
      throw new Error('403: Forbidden');
    }
  }
  catch(error){
    console.error(`inside admin get query${error.message}`);
    if(error.message.includes('403')){
      res.status(403).json({'message':'403: Forbidden'});
    }
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
