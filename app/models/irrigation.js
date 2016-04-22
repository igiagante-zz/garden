"use strict";

// Load required packages
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the irrigation schema
var irrigationSchema = new mongoose.Schema({
  irrigationDate: {type: Date, default: new Date()},
  quantity: Number,
  gardenId: Schema.Types.ObjectId,
  doseId: Schema.Types.ObjectId
});

// Export the Mongoose model
module.exports = mongoose.model('Irrigation', irrigationSchema);