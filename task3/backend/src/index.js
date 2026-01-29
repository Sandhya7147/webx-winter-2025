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

const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });
const port = process.env.BLOG_PORT || 5000;

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
    if(!(await bcrypt.compare(pwd,resdb.rows[0].pwd_hash))){
      throw new Error('401: Unauthorized');
    }

    const row=resdb.rows[0];
    const user={id:row.id, username:row.username}
    const accessToken= jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

    res.status(201).json({
      accessToken:accessToken,
      username:row.username,
      bio:row.bio,
      pfp:row.profile_pic
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

  const queryText = 'INSERT INTO users(username,pwd_hash) VALUES($1,$2)';
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
app.patch('/updatebio', authenticateToken, async (req, res) => {
  const bio=req.body.bio;
  const user_id=req.user.id;                                
  const queryText = 'UPDATE users SET bio=$1 WHERE id=$2 RETURNING *';
  const values = [bio, user_id ];
  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Row updated:", resdb.rows[0]);
    res.status(201).json(resdb.rows[0]);
  }catch(error){
    console.error(`inside update bio patch query${error.message}`);
  }
});

app.post('/makepost', authenticateToken, async (req, res) => {
  
  const content=req.body.content;
  const user_id=req.user.id;
  const title=req.body.title;
  const queryText = `
    INSERT INTO posts (user_id,content,blog_title)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [user_id,content,title];
  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Row inserted", resdb.rows[0]);
    res.status(201).json(resdb.rows[0]);
  }catch(error){
    console.error(`inside make a post post query${error.message}`);
  }
});

app.post('/makecomment', authenticateToken, async (req, res) => {
  
  const content=req.body.content;
  const user_id=req.user.id;
  const post_id=req.body.post_id;
   console.log("hello");
  const queryText = `
    INSERT INTO comments (post_id,user_id,comment_text)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [post_id,user_id,content]
  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Row inserted", resdb.rows[0]);
    res.status(201).json(resdb.rows[0]);
  }catch(error){
    console.error(`inside make a comment post query${error.message}`);
  }
});

//in progress so ignore
app.get('/feed/all/get',authenticateToken,async (req,res)=>{
  //todo
  const feedQuery = `
    SELECT 
      p.id, 
      p.content,
      p.blog_title,
      p.created_at, 
      u.username, 
      u.profile_pic,
      COUNT(l.id) AS like_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.post_id
    GROUP BY p.id, u.username, u.profile_pic
    ORDER BY p.created_at DESC
  `;
  const likesQuery= `SELECT post_id FROM likes WHERE user_id=$1`

  try{
    const resdb = await client.query(queryText);
    console.log(resdb);
    console.log("Rows retrieved", resdb.rows);
    res.status(200).json(resdb.rows);
  }catch(error){
    console.error(`inside get comments query${error.message}`);
  }
});

app.get('/feed/get',authenticateToken,async (req,res)=>{
  //todo
  const queryText = `
    SELECT 
      p.id, 
      p.content,
      p.blog_title,
      p.created_at, 
      u.username, 
      u.profile_pic,
      COUNT(l.id) AS like_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.post_id
    GROUP BY p.id, u.username, u.profile_pic
    ORDER BY p.created_at DESC
  `;
  try{
    const resdb = await client.query(queryText);
    console.log(resdb);
    console.log("Rows retrieved", resdb.rows);
    res.status(200).json(resdb.rows);
  }catch(error){
    console.error(`inside get comments query${error.message}`);
  }
});

//will later extend to get users posts
app.get('/user/posts/get',authenticateToken,async (req,res)=>{
  const user_id=req.user.id;
  const queryText = `SELECT id FROM posts WHERE user_id=$1`;
  const values=[user_id];
  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Rows retrieved", resdb.rows);
    res.status(200).json(resdb.rows);
  }catch(error){
    console.error(`inside get user posts query${error.message}`);
  }
});

app.get('/user/comments/get',authenticateToken,async (req,res)=>{
  const user_id=req.user.id;
  const queryText = `SELECT id FROM comments WHERE user_id=$1`;
  const values=[user_id];
  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Rows retrieved", resdb.rows);
    res.status(200).json(resdb.rows);
  }catch(error){
    console.error(`inside get user comments query${error.message}`);
  }
});

app.get('/user/likes/get',authenticateToken,async (req,res)=>{
  const user_id=req.user.id;
  const queryText = `SELECT post_id FROM likes WHERE user_id=$1`
  const values = [user_id];
  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Rows retrieved", resdb.rows);
    res.status(200).json(resdb.rows);
  }catch(error){
    console.error(`inside get user likes query${error.message}`);
  }
});

app.get('/comments/get/:post_id',authenticateToken,async (req,res)=>{
  const post_id=req.params.post_id;
  const queryText = `
  SELECT 
    c.id, 
    c.comment_text, 
    c.created_at, 
    u.username, 
    u.profile_pic
  FROM comments c
  JOIN users u ON c.user_id = u.id
  WHERE c.post_id = $1
  ORDER BY c.created_at DESC
`;
  const values = [post_id];
  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Rows retrieved", resdb.rows);
    res.status(200).json(resdb.rows);
  }catch(error){
    console.error(`inside get comments query${error.message}`);
  }
});

app.post('/likecount/POST/:post_id', authenticateToken, async (req, res) => {
  const post_id=req.params.post_id;
  const user_id=req.user.id;
   
  const queryText = `
    INSERT INTO likes (post_id, user_id)
    VALUES ($1, $2) 
    RETURNING *
  `;
  const values = [post_id,user_id]
  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Row inserted", resdb.rows[0]);
    res.status(200).json(resdb.rows[0]);
  }catch(error){
    console.error(`inside likecount post query${error.message}`);
  }
});


app.delete('/likecount/DELETE/:post_id', authenticateToken, async (req, res) => {
  const user_id=req.user.id;
  const post_id=req.params.post_id
  const queryText = 'DELETE FROM likes WHERE post_id= $1 AND user_id= $2 RETURNING *';
  const values=[post_id,user_id];

  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Row deleted", resdb.rows[0]);
    res.status(204).json(resdb.rows[0]);
  }catch(error){
    console.error(`inside likecount delete query${error.message}`);
  }
});

app.delete('/post/delete/:post_id', authenticateToken, async (req, res) => {
  const user_id=req.user.id;
  const post_id=req.params.post_id
  const queryText = 'DELETE FROM posts WHERE id= $1 AND user_id= $2 RETURNING *';
  const values=[post_id,user_id];

  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Row deleted", resdb.rows[0]);
    res.status(204).send();
  }catch(error){
    console.error(`inside post delete query${error.message}`);
  }
});

app.delete('/comment/delete/:id', authenticateToken, async (req, res) => {
  const user_id=req.user.id;
  const comment_id=req.params.id
  const queryText = 'DELETE FROM comments WHERE id= $1 AND user_id= $2 RETURNING *';
  const values=[comment_id,user_id];

  try{
    const resdb = await client.query(queryText, values);
    console.log(resdb);
    console.log("Row deleted", resdb.rows[0]);
    res.status(204).send();
  }catch(error){
    console.error(`inside post delete query${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
