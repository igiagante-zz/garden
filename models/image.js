var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Images = new Schema({
    thumbnailUrl: { type: String, required: true },
    url: { type: String, required: true },
    main: { type: Number, default: 0 },
    name: { type: String, required: true },
    size: Number
});

module.exports = mongoose.model('Images', Images);