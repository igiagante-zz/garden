// Load required packages
var mongoose = require('mongoose');
var Schema = mongoose.Schema

// Define our nutrient schema
var nutrientSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  dose_id: Schema.Types.ObjectId
});

// Export the Mongoose model
module.exports = mongoose.model('Nutrient', nutrientSchema);