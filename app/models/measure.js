/**
 * Created by igiagante on 29/9/15.
 */

// Load required packages
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define measure sensor schema
var measureSchema = new mongoose.Schema({
    measureDate: {type: Date, default: new Date()},
    measure: Number,
    unit: String,
    sensorId: { type: Schema.Types.ObjectId, required: true }
});

// Export the Mongoose model
module.exports = mongoose.model('Measure', measureSchema);
