// Load required packages
var Images = require('./image.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define our plant schema
var plantSchema = new mongoose.Schema({
  name: String,
  size: Number,
  phSoil: Number,
  ecSoil: Number,
  harvest: Number,
  images: [ Images ],
  irrigations: [ Schema.Types.ObjectId ],
  gardenId: { type: Schema.Types.ObjectId, required: true }
});

// Export the Mongoose model
module.exports = mongoose.model('Plant', plantSchema);
