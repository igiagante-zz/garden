// Load required packages
var mongoose = require('mongoose');
var Schema = mongoose.Schema

// Define our nutrient schema
var nutrientSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  dose_id: Schema.Types.ObjectId,
  images: [
    {
      _id: Types.ObjectId(),
      url: { type: String, required: true }
    }
  ]
});

// Export the Mongoose model
module.exports = mongoose.model('Nutrient', nutrientSchema);