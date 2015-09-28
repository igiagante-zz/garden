/**
 * Created by igiagante on 28/9/15.
 */

// Load required packages
var Images = require('./image.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define sensor schema
var sensorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    measures: [ Schema.Types.ObjectId ]
});

// Define measure sensor schema
var measureSchema = new mongoose.Schema({
    name: { type: String, required: true },
    measure: Number,
    unit: String,
    measureDate: {type: Date, default: new Date()}
});

// Export the Mongoose model
module.exports = mongoose.model('Measure', measureSchema);
module.exports = mongoose.model('Sensor', sensorSchema);

