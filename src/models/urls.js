const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  _id: String,
  url: String,
  interaction: [],
  changes: []
});

module.exports = mongoose.model('Urls', urlSchema);