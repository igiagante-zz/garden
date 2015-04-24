var Dosis = require('../models/dosis')

var dosis_sevice = function() {

	getDosis: function(dosis_id){
		Dosis.findById({dosis_id}, function(err, dosis){
			if(err)
				console.log(err);
			return dosis;
		});
	}; 
};