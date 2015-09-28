var dosesevice = require('./services/dose_service')
var Garden = require('../models/garden')
var Irrigation = require('../models/irrigation')
var dose = require('models/dose')
var async = require('async')

var nutrientsTemp = [];
var nutrients = [];

var irrigationService = {};
var irrigationsOut = [];

var ObjectId = require('mongoose').Types.ObjectId

irrigationService.calculateUseOfNutrient = function(garden_id){

		async.series([
			//Load irrigations
				function(callback) {
				Irrigation.find({ "gardenId" : garden_id}, function(err, irrigations){ 
			   		if(err) console.log(err); 

			   		for (var i = 0; i < irrigations.length; i++) {
			   			irrigationsOut.push({
			   				_id: irrigations[i]._id,
			   				irrigationDate: irrigations[i].irrigationDate,
			   				quantity: irrigations[i].quantity,
			   				gardenId: irrigations[i].gardenId,
			   				doseId: irrigations[i].doseId
			   			}
			   			);
			   		};

			   		//irrigationsOut = irrigations;

			   		callback();
			  	}); 	
			},
			//Init Nutrients
			function(callback) {
				console.log(' Start calculationg use of nutrients ');
				if(irrigationsOut === undefined || irrigationsOut.length == 0) {
					callback(console.log('No irrigations were found'));	
				}else {
					console.log(initnutrients(irrigationsOut));
				}	
			}
		], function(err) { //This function gets called after the two tasks have called their "task callbacks"
	        if (err) console.log(err);
		});
	};

var initnutrients = function(irrigations){

	doses = [];	

	console.log('------------------------------------------------------------------------------  ');
	console.log('----------------  irrigations inside of initnutrients method ----------------- ' );
	console.log('------------------------------------------------------------------------------  ');

	//get all the doses
	for (var i = 0; i < irrigations.length; i++) {

		async.series([ 
			function(callback){
				if(irrigations[i].doseId !== null){
					dose.findById(irrigations[i].doseId, function(err, dose){
						if(err)
							console.log(err);
						doses.push(dose);
					callback();	
					});
				}
			},

			function(callback){
				if(doses !== undefined){
					//get all the nutrients used by the dose
					for (var i = 0; i < doses.length; i++) {
						for (var j = 0; j < doses[i].nutrients.length; j++) {
							//it creates a nutrients temp array to manipulate later
							nutrientsTemp.push(doses[i].nutrients[j]);
						};
					};
					callback();
				}
			},

			function(callback){
				//Create keys for the nutrients map
				var exist = false;
				nutrients.push({ "name": nutrientsTemp[0].name, "quantity": nutrientsTemp[0].quantity});
				
				for (var i = 1; i < nutrientsTemp.length; i++) {
					for (var j = 0; j < nutrients.length; j++) {
						if(nutrientsTemp[i].name == nutrients[j].name){
							exist = true;
						}
					}	
					if(!exist){
						nutrients.push({ "name": nutrientsTemp[i].name, "quantity": nutrientsTemp[i].quantity});
						exist = false;
					}
				}
				console.log(' add name process finished ' + nutrients);
				callback();
			},

			function(callback){
				console.log("nutrientsTemp: " + nutrientsTemp);
				console.log("nutrients: " + nutrients);
				if(nutrientsTemp !== undefined && nutrients !== undefined){	
					//it loops the nutrients temp array and accumulates the values from each nutrient
					for (var i = 0; i < nutrientsTemp.length; i++) {
						for (var j = 0; j < nutrients.length; j++) {
							//increment the quantity of one nutrient		
						   if(nutrientsTemp[i].name == nutrients[j].name){
								nutrients[j].quantity = parseInt(nutrients[j].quantity) + parseInt(nutrientsTemp[i].quantity);
							}
						}
						if(i == nutrientsTemp.length){
							console.log(nutrients);
							callback();
						}
					};
				}					
			}
		]);
		
	};

};

module.exports = irrigationService;
