var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Images = new Schema({
	url: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    deleteUrl: { type: String, required: true },
    deleteType: { type: String, default: "DELETE" },
    name: { type: String, required: true },
    type: { type: String, required: true},
    size: Number,
    main: { type: Boolean, default: false},
    plantId: { type: Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('Images', Images);