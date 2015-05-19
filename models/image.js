var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Images = new Schema({
    kind: { 
        type: String, 
        enum: ['thumbnail', 'detail'],
        required: true
    },
    url: { type: String, required: true }
});

module.exports = mongoose.model('Images', Images);