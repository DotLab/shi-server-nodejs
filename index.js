const express = require('express');
const app = express();
const port = 3000;

const mongoose = require('mongoose');

const mongoDB = 'mongodb://localhost/scarletea';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on('error', () => console.log('mongodb connection failed'));

app.listen(port, () => console.log('listening on port ' + port));

app.use(express.json());

app.use('/v1', require('./routes/v1Router'));

module.exports = app;
