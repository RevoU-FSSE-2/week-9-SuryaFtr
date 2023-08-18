const express = require('express')
const mysql = require('mysql2')
const bodyParser = require('body-parser')

const app = express()

// Middleware
app.use(bodyParser.json())

const ports = 3000

// Connecting to mysql server
const dbConnect = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'sfr030197',
    database: 'week9'
});
dbConnect.connect(err => {
    if (err) {
        console.error('Error, cannot connect to MySQL: ' + err.stack)
        return;
    }
    console.log('Success, has connected to MySQL')
});

// Start server
app.listen(ports, () => {
    console.log(`Server listening at http://localhost:${ports}`);
});

