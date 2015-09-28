var Dose = require('models/dose')

var doseService = {};

doseService.getDose = function(dose_id){

		Dose.findById({ "_id " : dose_id}, function(err, dose){
			if(err)
				console.log(err);
			return dose;
		});
	}; 

module.exports = doseService;