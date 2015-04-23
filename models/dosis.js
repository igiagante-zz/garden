// Load required packages
var mongoose = require('mongoose');

// Define our dosis schema
var dosisSchema = new mongoose.Schema({
  ph: Number,
  ec: Number,
  irrigation_id: Schema.Types.ObjectId
});

// Export the Mongoose model
module.exports = mongoose.model('Dosis', dosisSchema);