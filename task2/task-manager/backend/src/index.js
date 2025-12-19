const express = require('express');
const cors =require('cors');
const path = require('path');
const app = express();

const { Client } = require('pg');

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  })
)
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

app.post('/tasks/post', async (req, res) => {
  const task=req.body.title;
  const completed=req.body.completed;

  const queryText = 'INSERT INTO tasks(task, completed) VALUES($1, $2) RETURNING *';
  const values = [task, completed];
  try{
      const resdb = await client.query(queryText, values);
      console.log(resdb);
      console.log("Row added:", resdb.rows[0]);
      res.status(201).json(resdb.rows[0]);
  }catch(error){
    console.error(`inside post query${error.message}`);
  }
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
