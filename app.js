const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const myConnection = require('express-myconnection');
require('dotenv').config();
const fs = require('fs');
const dbOptions = require('./config');
const authRoutes = require('./routes/auth');
const PatyRoutes = require('./routes/party')
// var moment = require('moment-timezone');
// const cron = require('node-cron');

const PORT = 8004;

app.use(
	cors({
		"origin": '*',
		"methods": 'GET,HEAD,PUT,PATCH,POST,DELETE',
		"preflightContinue": false,
		"optionsSuccessStatus": 204,
	})
);

app.use(bodyParser.json());
app.use(express.json());

var connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
	database: process.env.DB,
	dateStrings: true,
	insecureAuth: true,
});

connection.connect((err) => {
	if (err) {
		return console.log(`error : `, err);
	} else {
		return console.log('Connect Database Success');
	}
});

app.use(myConnection(mysql, dbOptions.dbOptions, 'pool'));

app.use('/api', authRoutes);
app.use('/api', PatyRoutes);

app.listen(PORT, () => {
	console.log('ready server on http://localhost:' + PORT);
});