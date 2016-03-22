// Load required packages
var Images = require('./image.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define our plant schema
var plantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: Number,
  phSoil: Number,
  ecSoil: Number,
  harvest: Number,
  irrigations: [ Schema.Types.ObjectId ],
  gardenId: { type: Schema.Types.ObjectId, required: true },
  images: [
    {
      _id: Schema.Types.ObjectId,
      url: { type: String, required: true },
      thumbnailUrl: { type: String, required: true },
      name: { type: String, required: true },
      type: { type: String, required: true },
      size: Number,
      main: { type: Boolean, default: 0 }
    }
  ]
});

// Export the Mongoose model
module.exports = mongoose.model('Plant', plantSchema);
