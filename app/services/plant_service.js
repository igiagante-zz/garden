var Plant = require('../models/plant.js'),
	logger = require('../utils/logger');

/**
 * Get plant's info using id
 * @param plantId
 * @param getPlantCallback
 */
var getPlantInfoById = function(plantId, getPlantCallback){

	if (!plantId.match(/^[0-9a-fA-F]{24}$/)) {
	  getPlantCallback('plantId is NOT valid: ' + plantId);
	}

	Plant.findById(plantId, function(error, plant){
		if(error) {
			logger.debug('The plant wasn\'t found');
			return getPlantCallback(error);
		}	
		getPlantCallback(undefined, plant);
	});
};

/**
 * Get plant's info using name
 * @param plantId
 * @param getPlantCallback
 */
var getPlantInfoByName = function(name, getPlantCallback){

	Plant.find({"name" : name}, function(error, plant){
		if(error) {
			logger.debug('The plant wasn\'t found');
			return getPlantCallback(error);
		}
		getPlantCallback(undefined, plant);
	});
};

var getPlantName = function(plantId, getPlantCallback){

	Plant.findById(plantId, function(error, plant){
		if(error) {
			console.log('The plant wasn\'t found');
			console.log(error);
			return getPlantCallback(error);
		}	
		getPlantCallback(undefined, plant.name);
	});
};

module.exports = {
	getPlantInfoById : getPlantInfoById,
	getPlantInfoByName : getPlantInfoByName,
	getPlantName : getPlantName
}