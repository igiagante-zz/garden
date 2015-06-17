var Plant = require('../models/plant.js');

var getPlantInfo = function(plantId, getPlantCallback){

	if (!plantId.match(/^[0-9a-fA-F]{24}$/)) {
	  getPlantCallback('plantId is NOT valid: ' + plantId);
	}

	Plant.findById(plantId, function(error, plant){
		if(error) {
			console.log('The plant wasn\'t found');
			console.log(error);
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
	getPlantInfo : getPlantInfo,
	getPlantName : getPlantName
}