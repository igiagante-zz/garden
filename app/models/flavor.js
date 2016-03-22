/**
 * Created by igiagante on 21/3/16.
 */

var mongoose = require('mongoose');
var Types = mongoose.Types;

// Define our flavor schema
var flavorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    images: [
        {
            _id: Types.ObjectId(),
            url: { type: String, required: true }
        }
    ]
});

// Export the Mongoose model
module.exports = mongoose.model('Flavor', flavorSchema);

