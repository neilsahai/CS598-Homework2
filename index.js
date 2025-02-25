
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 80;


app.use(bodyParser.json());


const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'neil123',  
  database: 'userdb'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MariaDB:', err);
  } else {
    console.log('Connected to MariaDB');
  }
});


app.get('/greeting', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Hello World</title>
      </head>
      <body>
        <h1>Hello World!</h1>
      </body>
    </html>
  `);
});


app.post('/register', (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  
  const sql = 'INSERT INTO Users (username) VALUES (?)';
  db.query(sql, [username], (err, result) => {
    if (err) {

      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: "Username already exists" });
      }
      return res.status(500).json({ error: "Database error", details: err });
    }
    res.json({ success: true, message: `User '${username}' registered successfully.` });
  });
});

app.get('/list', (req, res) => {
  const sql = 'SELECT username FROM Users';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error", details: err });
    }
    // Map results to an array of usernames
    const users = results.map(row => row.username);
    res.json({ users });
  });
});


app.post('/clear', (req, res) => {
  const sql = 'DELETE FROM Users';
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error", details: err });
    }
    res.json({ success: true, message: "All users have been cleared from the database." });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
