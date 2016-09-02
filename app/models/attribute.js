/**
 * @author Ignacio Giagante, on 3/6/16.
 */

"use strict";

// Load required packages
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Define the attribute schema
var attributeSchema = new mongoose.Schema({

    _id: Schema.Types.ObjectId,
    /*
     Type of attribute: Effect, Medicinal, Symptom
     */
    type: {type: String, required: true},
    name: {type: String, required: true}
});

// Export the Mongoose model
module.exports = mongoose.model('Attribute', attributeSchema);
