var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Images = new Schema({
    kind: { 
        type: String, 
        enum: ['thumbnail', 'detail'],
        required: true
    },
    url: { type: String, required: true },
    main: Boolean
});

module.exports = mongoose.model('Images', Images);