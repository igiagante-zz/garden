var Dosis = require('../models/dosis')

var dosisSevice = {};

dosisSevice.getDosis = function(dosis_id){

		Dosis.findById({ "_id " : dosis_id}, function(err, dosis){
			if(err)
				console.log(err);
			return dosis;
		});
	}; 

module.exports = dosisSevice;