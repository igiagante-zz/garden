var dosis_sevice = require('../services/dosis_sevice')
var Garden = require('../models/garden')
var Irrigation = require('../models/irrigation')
var Dosis = require('../models/dosis')


var irrigationSevice = {};

irrigationSevice.calculateUseOfNutrient = function(garden_id){
		//get all irrigations from one garden
		var irrigations = getAllIrrigationFromOneGarden(garden.garden_id);

		var nutrients = {};

		for (var i = 0; i < irrigations.length; i++) {
			irrigations[i]
		};
	};

irrigationSevice.getAllIrrigationFromOneGarden = function(fromDate, toDate){

	Irrigation.find({ "garden_id" : garden_id }, function(err, garden){
			if(err)
				console.log(err);
			return garden;
		});
	};