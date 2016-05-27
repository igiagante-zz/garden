/**
 * @author Ignacio Giagante, on 27/5/16.
 */

"use strict";

// Load required packages
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Define the flavor schema
var flavorSchema = new mongoose.Schema({
    _id: Schema.Types.ObjectId,
    name: {type: String, required: true},
    imageUrl: {type: String, required: true}
});

// Export the Mongoose model
module.exports = mongoose.model('Flavor', flavorSchema);