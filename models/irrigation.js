// Load required packages
var mongoose = require('mongoose');

// Define our irrigation schema
var irrigationSchema = new mongoose.Schema({
  irrigationDate: {type: Date, default: new Date()},
  quantity: Number,
  garden_id: Schema.Types.ObjectId,
  dosis_id: Schema.Types.ObjectId
});

// Export the Mongoose model
module.exports = mongoose.model('Irrigation', irrigationSchema);