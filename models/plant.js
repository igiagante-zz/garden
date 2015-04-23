// Load required packages
var mongoose = require('mongoose');

// Define our plant schema
var plantSchema = new mongoose.Schema({
  name: String,
  size: Number,
  phSoil: Number,
  ecSoil: Number,
  irrigation_id: Schema.Types.ObjectId
});

// Export the Mongoose model
module.exports = mongoose.model('Plant', plantSchema);
