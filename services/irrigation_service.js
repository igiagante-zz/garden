var dosesevice = require('./dosis_service')
var Garden = require('../models/garden')
var Irrigation = require('../models/irrigation')
var Dosis = require('../models/dosis')
var async = require('async')

var nutrientsTemp = [];
var nutrients = [];

var irrigationSevice = {};
var irrigationsOut = [];

var ObjectId = require('mongoose').Types.ObjectId

irrigationSevice.calculateUseOfNutrient = function(garden_id){

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
			   				dosisId: irrigations[i].dosisId
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
	console.log('----------------  irrigations insise of initnutrients method ----------------- ' );
	console.log('------------------------------------------------------------------------------  ');

	


	async.series([

		function(callback){
			async.each(irrigations, function(irrigation, callback) {
				  Dosis.findById(irrigation.dosisId, function(err, dosis){
						if(err)
							console.log(err);
						doses.push(dosis);	
						callback();				
					}); 
				}, function(err){
				    // if any of the file processing produced an error, err would equal that error
				    if( err ) {
				      // One of the iterations produced an error.
				      // All processing will now stop.
				      console.log('A dosis was not found');
				    } else {
				      console.log(doses.length + ' were added');
				    }
				});
			callback();
		},

		function(callback){
			console.log('doses' + doses);
			if(doses !== undefined){
				for (var i = 0; i < doses.length; i++) {
					for (var j = 0; j < doses[i].nutrients.length; j++) {
						//it creates a nutrients temp array to manipulate later
						console.log(' new nutrient : ' + doses[i].nutrients[j]);
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
			callback();
		},

		function(callback){
			console.log("nutrientsTemp: " + nutrientsTemp);
			console.log("nutrients: " + nutrients);
			if(nutrientsTemp !== undefined && nutrients !== undefined){	
				//it loops the nutrients temp array and acumulates the values from each nutrient
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

module.exports = irrigationSevice;
