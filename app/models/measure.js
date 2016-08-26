/**
 * Created by igiagante on 29/9/15.
 */

"use strict";

// Load required packages
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define measure sensor schema
var measureSchema = new mongoose.Schema({
    measureDate: {type: Date, default: new Date()},
    measure: Number,
    unit: String,
    sensor: {
        name: { type: String, required: true }
    },
    gardenId: { type: Schema.Types.ObjectId, required: true },
    plantId: { type: Schema.Types.ObjectId }
});

// Export the Mongoose model
module.exports = mongoose.model('Measure', measureSchema);
