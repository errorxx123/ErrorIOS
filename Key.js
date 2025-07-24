const mongoose = require('mongoose');
module.exports = mongoose.model('Key', new mongoose.Schema({
  key: String
}));
