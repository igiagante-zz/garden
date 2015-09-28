// Load required packages
var mongoose = require('mongoose');

// Define our dose schema
var doseSchema = new mongoose.Schema({
	created: { type: Date, default: new Date() },
	water: Number,
	phDose: Number,
	ph: Number,
	ec: Number,
	nutrients: [
		{
			name: String,
			quantity: Number
		}
	]
});

// Export the Mongoose model
module.exports = mongoose.model('Dose', doseSchema);