var dosesevice = require('./dosis_service')
var Garden = require('../models/garden')
var Irrigation = require('../models/irrigation')
var Dosis = require('../models/dosis')
var async = require('async')
var logger = require('../utils/logger')

var irrigationSevice = {};
var irrigationsOut = [];

var ObjectId = require('mongoose').Types.ObjectId

var calculateUseOfNutrient = function(garden_id, populateCallback){

		async.series([
			//Load irrigations
				function(callback) {
					Irrigation.find({ "gardenId" : garden_id}, function(err, irrigations){ 
				   		if(err) logger.log(err); 

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
				   		callback();
				  	}); 	
				},
				//Init Nutrients
				function(callback) {
					
				logger.log(' ------------------------------------------------------------------------------ ');
				logger.log(' -----------------------  Start proccessing  Nutrients ------------------------ ' );
				logger.log(' ------------------------------------------------------------------------------ ');
				logger.log(' ');

					if(irrigationsOut === undefined || irrigationsOut.length == 0) {
						callback(logger.log('No irrigations were found'));	
					}else {
						initnutrients(irrigationsOut, callback, populateCallback);
					}	
				}
		], function(err) { //This function gets called after the two tasks have called their "task callbacks"
	        if (err) logger.log(err);
		});
	};

var initnutrients = function(irrigations, callbackOut, populateCallback){

	var nutrientsTemp = [];
	var nutrients = [];

	var doses = [];

	var readIrrigations = function(irrigations, callback) {
    
    var index = 0;
    	var readCallback = function(error, data) {
	        if(error) {
	            callback(error, undefined);
	            return;
	        }
	        doses.push(data);
	        if(++index === irrigations.length) {
	            callback(undefined, doses);
	        } else {
	            readDoses(irrigations[index], readCallback);
	        }
	    };
		readDoses(irrigations[index], readCallback);
	};

	var readDoses = function(irrigation, callback) {

		Dosis.findById(irrigation.dosisId, function(err, dosis){
			if (err){
                logger.log(err);
            } else {
                callback(undefined, dosis);
            }	
		});
	};

	var createNutrientsTemp = function(callback){
		if(doses !== undefined){
			//get all the nutrients used by the dosis
			for (var i = 0; i < doses.length; i++) {
				for (var j = 0; j < doses[i].nutrients.length; j++) {
					//it creates a nutrients temp array to manipulate later
					nutrientsTemp.push(doses[i].nutrients[j]);
				};
			};
			callback();
		}
	};

	var initNutrientsNames = function(callback){
		//Create keys for the nutrients map
		var exist = false;
		nutrients.push({ "name": nutrientsTemp[0].name, "quantity": 0 });
		
		for (var i = 1; i < nutrientsTemp.length; i++) {
			for (var j = 0; j < nutrients.length; j++) {
				if(nutrientsTemp[i].name == nutrients[j].name){
					exist = true;
				}
			}	
			if(!exist){
				nutrients.push({ "name": nutrientsTemp[i].name, "quantity": 0 });
				exist = false;
			}
		}
		callback();
	}; 

	var sumQuantityOfNutrientsUsed = function(callback){
		if(nutrientsTemp !== undefined && nutrients !== undefined){	
			//it loops the nutrients temp array and acumulates the values from each nutrient
			for (var i = 0; i < nutrientsTemp.length; i++) {
				for (var j = 0; j < nutrients.length; j++) {
					//increment the quantity of one nutrient		
				   if(nutrientsTemp[i].name == nutrients[j].name){
						nutrients[j].quantity = parseInt(nutrients[j].quantity) + parseInt(nutrientsTemp[i].quantity);
					}
				}
			};
		}
		for (var i = 0; i < nutrients.length; i++) {
			logger.log("nutrients: " + i + " " + nutrients[i].name + " = " + nutrients[i].quantity);
		};
		populateCallback(undefined, nutrients);	
		callback();	
	};

	async.series([ 
		
		function(callbackOut){
			readIrrigations(irrigations, callbackOut);
		},

		function(callback){
			createNutrientsTemp(callback);
		},

		function(callback){
			initNutrientsNames(callback);
		},

		function(callback){
			sumQuantityOfNutrientsUsed(callback);		
		}

	]);

};

module.exports = {
	calculateUseOfNutrient : calculateUseOfNutrient
};