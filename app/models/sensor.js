/**
 * Created by igiagante on 28/9/15.
 */

// Load required packages
var mongoose = require('mongoose');

// Define sensor schema
var sensorSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

module.exports = mongoose.model('Sensor', sensorSchema);

