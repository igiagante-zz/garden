// Load required packages
var mongoose = require('mongoose');

// Define the dose schema
var doseSchema = new mongoose.Schema({
	water: Number,
	phDose: Number,
	ph: Number,
	ec: Number,
	nutrients: [
		{
            _id: Schema.Types.ObjectId,
			name: String,
			ph: Number,
            npk: String,
            description: String,
            images: [
                {
                    _id: Schema.Types.ObjectId,
                    url: { type: String, required: true },
                    thumbnailUrl: { type: String, required: true }
                }
            ]
		}
	],
    editable: {type: Boolean, required:true}
});

// Export the Mongoose model
module.exports = mongoose.model('Dose', doseSchema);