// Load required packages
var mongoose = require('mongoose');

// Define our garden schema
var gardenSchema = new mongoose.Schema({
  name: String,
  startDate: {type: Date, default: new Date()},
  endDate: {type: Date, default: new Date()}
});

// Export the Mongoose model
module.exports = mongoose.model('Garden', gardenSchema);