/**
 * Created by igiagante on 25/8/16.
 */


"use strict";

// Load required packages
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Define the plant schema
var plantHistoricSchema = new mongoose.Schema({
    date: {type: Date, default: new Date()},
    plantId: Schema.Types.ObjectId,
    ec: Number,
    ph: Number,
    height: Number
});

// Export the Mongoose model
module.exports = mongoose.model('PlantHistoric', plantHistoricSchema);

