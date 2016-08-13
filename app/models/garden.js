"use strict";

// Load required packages
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Define our garden schema
var gardenSchema = new mongoose.Schema({
  userId: {type: Schema.Types.ObjectId, required: true},
  name: String,
  startDate: {type: Date, default: new Date()},
  endDate: {type: Date}
});

// Export the Mongoose model
module.exports = mongoose.model('Garden', gardenSchema);