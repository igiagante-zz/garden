"use strict";

// Load required packages
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Define the plant schema
var plantSchema = new mongoose.Schema({
    name: {type: String, required: true},
    seedDate: {type: Date, default: new Date()},
    size: Number,
    phSoil: Number,
    ecSoil: Number,
    floweringTime: String,
    genotype: String,
    harvest: Number,
    description: String,
    irrigations: [Schema.Types.ObjectId],
    resourcesIds: [Schema.Types.ObjectId], // each id corresponds to the one image id
    gardenId: {type: Schema.Types.ObjectId, required: true},
    images: [
        {
            _id: Schema.Types.ObjectId,
            url: {type: String, required: true},
            thumbnailUrl: {type: String, required: true},
            name: {type: String, required: true},
            type: {type: String, required: true},
            size: Number,
            main: {type: Boolean, default: 0}
        }
    ],
    flavors: [
        {
            _id: Schema.Types.ObjectId,
            name: {type: String, required: true},
            imageUrl: {type: String, required: true}
        }
    ],
    attributes: [
        {
            _id: Schema.Types.ObjectId,
            /*
             Type of attribute: Effect, Medicinal, Symptom
             */
            type: {type: String, required: true},
            name: {type: String, required: true},
            percentage: {type: Number, required: true}
        }
    ],
    plagues: [
        {
            _id: Schema.Types.ObjectId,
            name: {type: String, required: true},
            imageUrl: {type: String, required: true},
        }
    ]
});

// Export the Mongoose model
module.exports = mongoose.model('Plant', plantSchema);
