// Load required packages
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define our plant schema
var plantSchema = new mongoose.Schema({
  name: String,
  size: Number,
  phSoil: Number,
  ecSoil: Number,
  harvest: Number,
  irrigations: [ Schema.Types.ObjectId ],
  gardenId: Schema.Types.ObjectId
});

// Export the Mongoose model
module.exports = mongoose.model('Plant', plantSchema);
