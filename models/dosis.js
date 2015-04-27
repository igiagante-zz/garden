// Load required packages
var mongoose = require('mongoose');

// Define our dosis schema
var dosisSchema = new mongoose.Schema({
	created: { type: Date, default: new Date() },
	water: Number,
	phDosis: Number,
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
module.exports = mongoose.model('Dosis', dosisSchema);