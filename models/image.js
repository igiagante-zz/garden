var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Images = new Schema({
    thumbnailUrl: { type: String, required: true },
    url: { type: String, required: true },
    main: { type: Number, default: 0}
});

module.exports = mongoose.model('Images', Images);