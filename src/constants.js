const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  urlsFile: `../input/urls.txt`,
  apiSistrix: process.env.api_key_SISTRIX,

  // API Mongoose
  apiURL: `http://localhost:${process.env.PORT}/api/urls`
}