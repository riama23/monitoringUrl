const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const URI = 'mongodb://localhost:27017/prueba';
dotenv.config();

const app = express();

// Db connection
mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(db => console.log('Db is connected'))
  .catch(error => console.error(error));

// Settings 
app.set('port', process.env.PORT);

// Middlewares
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/urls', require('./routes/url.routes'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));;

// Starting the server
app.listen(app.get('port'), () => {
  console.log(`Server on port ${app.get('port')}`);
});