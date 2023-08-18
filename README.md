# API for Simple MBanking App
## Introduction
This is a API for simple backend server for MBanking App using NodeJS & MySQL, that allows users to perform basic CRUD (Creat, Read, Update, Delete) operations on application.

## Content
* Introduction
* Content
* Deploy
* Requirement Tools
* Get Started
* Create Connection on MySQL and Database
* Create Table on Database
* Create Data on Database Table
* The Installed Package for the Project
* Making a connection server between NodeJS and MySQL
* Making a API routes for CRUD operations on server
* Testing Server on Locally
* Deploy

## Requirement Tools
1. Git and Github
2. Google Chrome
3. VS Code
4. REST Client Tools(Postman, Thunder Client(VS Code Extension))
5. Node Js
6. Express
7. MySQL
8. DBeaver
9. Deploy Tools(Database: railway.app, API: fly.io)

## Get Started
Before we start to build the server, first you need to download and install Node.Js, choose the latest LTS version of it.
Next, you must download and install MySQL server for database management system on the server.

## Create Connection on MySQL and Database
Create a new connection on mysql server and database on DBeaver.
![1-create-new-connection database](https://github.com/RevoU-FSSE-2/week-9-SuryaFtr/assets/127850712/c380f07b-8f86-4fc5-a2c8-dca53a67919d)

## Create Table on Database
Create a new table on database with DBeaver. We will use a relational model database on the table.

Table : users
```sql
-- CREATE TABLE USERS QUERY
CREATE TABLE users (
	id INT PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(255),
	address TEXT
)
```

Table : transactions
```sql
-- CREATE TABLE TRANSACTIONS QUERY
CREATE TABLE transactions (
	id INT PRIMARY KEY AUTO_INCREMENT,
	user_id INT,
	type ENUM('income', 'expense'),
	amount DECIMAL(15, 2),
	FOREIGN KEY (user_id) REFERENCES users(id)
)
```

## Create Data on Database Table
Create a new record data on database table with DBeaver. 

Table : users
```sql
-- INSERT DATA USERS QUERY
INSERT INTO users (name, gender, address)
VALUES
    ('Budi', '123 Main St'),
    ('Asep', '456 Elm St'),
    ('Jenny', '789 Oak Ave'),
    ('Mary', '567 Pine Rd'),
    ('Cecep', '890 Maple Ln');
```

Table : transactions
```sql
-- INSERT TABLE TRANSACTIONS QUERY
INSERT INTO transactions (user_id, type, amount) 
	VALUES 
	(4, 'income', 2000000),
	(5, 'income', 1000000),
	(4, 'expense', 500000),
	(5, 'expense', 250000);
```
## The Installed Package for the Project

1. `npm install body-parser` (Node.js body parsing middleware. Parse incoming request bodies in a middleware before your handlers, available under the req.body property.)

2. `npm install express` for install express js(minimalist web framework for Node.js).

3. `npm install mysql2` for intall MySQL client for Node.js (MySQL2 is free from native bindings and can be installed on Linux, Mac OS or Windows without any issues).

4. `npm install -D nodemon` for install nodemon, that is a tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected.

## Making a connection server between NodeJS and MySQL
```javascript
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
```

Run on terminal `npm start`, to start the server.

![2-start-server](https://github.com/RevoU-FSSE-2/week-9-SuryaFtr/assets/127850712/c62e2f26-b7a3-4dc3-b2a8-be494a81ec63)

## Making a API routes for CRUD operations on server
Error Server Handling 
```javascript
// Common Response
const commonResponse = function (data, error) {
    if (error) {
        return {
            success: false,
            error: 'An error occurred while fetching user information'
        }
    }
    return {
        success: true,
        data: data
    }
}
```

GET user/:id -> for information with current balance and total accumulated expenses (balance = total income - total expense)
```javascript
// GET users/:id -> for information with balance and total expenses
app.get('/users/:id', (request, response) => {
    const userId = request.params.id;
    const sql = 'SELECT users.id, name, address, ' +
        'SUM(CASE WHEN type="income" THEN amount ELSE 0 END) AS total_income, ' +
        'SUM(CASE WHEN type="expense" THEN amount ELSE 0 END) AS total_expense ' +
        'FROM users ' +
        'LEFT JOIN transactions ON users.id = transactions.user_id ' +
        'WHERE users.id = ? ' +
        'GROUP BY users.id';
    dbConnect.query(sql, userId, (err, result, fields) => {
        if (err) {
            response.status(500).json(commonResponse(null, "Server Error"))
            response.end()
            return
        }
        const userData = {
            id: result[0].id,
            name: result[0].name,
            address: result[0].address,
            balance: result[0].total_income - result[0].total_expense,
            expense: result[0].total_expense
        }
        response.status(200).json(commonResponse(userData, null))
        response.end()
    })
})
```

POST /transaction -> for add new transaction
```javascript
// POST /transaction -> for add new transaction
app.post('/transactions', (request, response) => {
    const { user_id, type, amount } = request.body;
    const sql = 'INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)';
    dbConnect.query(sql, [user_id, type, amount], (err, result, fields) => {
        if (err) {
            response.status(500).json(commonResponse(null, "Server Error"))
            response.end()
            return
        }
        response.status(200).json({ message: 'Transaction added successfully', id: result.insertId })
        response.end()
    })
})
```

PUT /transactions/:id -> for update transaction
```javascript
// PUT /transactions/:id -> for update transaction 
app.put('/transactions/:id', (request, response) => {
    const transactionId = request.params.id;
    const { type, amount } = request.body;
    const sql = 'UPDATE transactions SET type = ?, amount = ? WHERE id = ?';

    dbConnect.query(sql, [type, amount, transactionId], (err) => {
        if (err) {
            response.status(500).json(commonResponse(null, "Server Error"))
            response.end()
            return
        }
        response.status(200).json({ message: 'Transaction updated successfully' })
        response.end()
    })
})
```

DELETE /transactions/:id -> for delete transaction
```javascript
// DELETE /transactions/:id -> for delete transaction 
app.delete('/transactions/:id', (request, response) => {
    const transactionId = request.params.id;
    const sql = 'DELETE FROM transactions WHERE id = ?';

    dbConnect.query(sql, [transactionId], (err) => {
        if (err) {
            response.status(500).json(commonResponse(null, "Server Error"))
            response.end()
            return
        }
        response.status(200).json({ message: 'Transaction deleted successfully' })
        response.end()
    })
})
```

## Testing Server on Locally
1. GET users/:id -> for information with current balance and total accumulated expenses (balance = total income - total expense)

![3-get-users-id](https://github.com/RevoU-FSSE-2/week-9-SuryaFtr/assets/127850712/aea4011f-62d0-4e03-a57d-24bd8f4b69d8)

2. POST /transaction -> for add new transaction

![4-post-transaction-income](https://github.com/RevoU-FSSE-2/week-9-SuryaFtr/assets/127850712/26cad2ce-c829-4f5a-b43d-991aef927e84)

![5-post-transaction-outcome](https://github.com/RevoU-FSSE-2/week-9-SuryaFtr/assets/127850712/405ba36e-cb4d-4a7e-9433-9f6122310f3f)

3. PUT /transactions/:id -> for update transaction

![6-put-transaction-id](https://github.com/RevoU-FSSE-2/week-9-SuryaFtr/assets/127850712/f9040ef0-866d-485a-9899-0042f81c1330)

4. DELETE /transactions/:id -> for delete transaction

![7-delete-transaction-id](https://github.com/RevoU-FSSE-2/week-9-SuryaFtr/assets/127850712/55c2ecd7-86b7-4a13-9915-2d3429c7fcac)

## Deploy
Database on railways.app. 

![Deploy-database](https://github.com/RevoU-FSSE-2/week-9-SuryaFtr/assets/127850712/abe91756-8876-45b1-90fe-652cc46605b2)

API on app.cyclic.sh 

![Deploy-API-1](https://github.com/RevoU-FSSE-2/week-9-SuryaFtr/assets/127850712/1ecef5b1-cba9-4251-aa3d-e11937839278)

![Deploy-API-2](https://github.com/RevoU-FSSE-2/week-9-SuryaFtr/assets/127850712/4de8de13-682d-46ca-bd35-055b1e6edc7a)

Deploy Link : https://hungry-kerchief-pig.cyclic.cloud/

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/Z42oEjTh)
