/**
 * Created by igiagante on 29/3/16.
 */

var mongoose = require('mongoose');
var Types = mongoose.Types;

// Define the attribute schema
var attributeSchema = new mongoose.Schema({
    plantId: { type: Types.ObjectId, required: true },
    effects: [
        {
            name: String,
            percentage: Number
        }
    ],
    medicinal: [
        {
            name: String,
            percentage: Number
        }
    ],
    symptoms: [
        {
            name: String,
            percentage: Number
        }
    ],
    plagues: [
        {
            name: String,
            percentage: Number
        }
    ]
});

// Export the Mongoose model
module.exports = mongoose.model('Attribute', attributeSchema);