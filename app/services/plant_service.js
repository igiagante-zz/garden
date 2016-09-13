"use strict";

var Plant = require('../models/plant'),
    logger = require('../utils/logger'),
    utilObject = require('../commons/util_object'),
    async = require('async');

/**
 * Get plant's info using id
 * @param plantId
 * @param getPlantCallback
 */
var getPlantInfoById = function (plantId, getPlantCallback) {

    if (!plantId.match(/^[0-9a-fA-F]{24}$/)) {
        getPlantCallback('plantId is NOT valid: ' + plantId);
    }

    Plant.findById(plantId, function (error, plant) {
        if (error) {
            logger.debug('The plant wasn\'t found');
            return getPlantCallback(error);
        }
        getPlantCallback(undefined, plant);
    });
};

/**
 * Return resources ids related to the images from database.
 * @param modelId Represent the Id from the model which contains the images
 * @param callback
 * @returns {Array} Represent resources ids images
 */
var getResourcesIdsImagesForPlant = function (modelId, callback) {

    logger.debug(' Getting resources ids images from model ');

    var resourcesIds = [];

    Plant.find({_id: modelId}, function (err, plantDB) {
        if (err) {
            return callback(err);
        }

        if (plantDB === null) {
            return callback('The plant was not found');
        }

        var plant = JSON.parse(JSON.stringify(plantDB))[0];

        if (plant.images) {
            for (var i = 0; i < plant.images.length; i++) {
                resourcesIds.push(plant.images[i]._id);
            }
        }
        callback(undefined, resourcesIds);
    });
};

/**
 * Get plant's info using its name
 * @param name Plant's name
 * @param getPlantCallback
 */
var getPlantInfoByName = function (name, getPlantCallback) {

    Plant.find({"name": name}, function (error, plant) {
        if (error) {
            logger.debug('The plant wasn\'t found');
            return getPlantCallback(error);
        }
        getPlantCallback(undefined, plant);
    });
};

var getPlantName = function (plantId, getPlantCallback) {

    Plant.findById(plantId, function (err, plant) {
        if (err) {
            console.log('The plant wasn\'t found');
            console.log(error);
            return getPlantCallback(error);
        }
        return getPlantCallback(undefined, plant.name);
    });
};

var convertPlantsIdsFromMongo = function (plants, callback) {

    async.each(plants, function (plant, callback) {
        convertIdsFromMongo(plant, callback);
    }, function (err) {
        if (err) {
            return callback(err);
        }
        return callback(undefined);
    });
};

/**
 * Convert the inner ids from one plant to MongoDB ObjectId
 * @param plant Plant Object
 * @param convertIdsCallback
 */
var convertIds = function (plant, convertIdsCallback) {

    var flavors, attributes, plagues;

    async.series([
            function (callback) {
                if (plant) {
                    utilObject.convertIdToObjectId(plant, callback);
                } else {
                    callback(undefined);
                }
            },
            function (callback) {
                //obtain flavors
                if (plant.flavors) {
                    flavors = JSON.parse(plant.flavors);
                    utilObject.convertIdsToObjectIds(flavors, callback);
                } else {
                    callback(undefined);
                }
            },
            function (callback) {
                //obtain attributes
                if (plant.attributes) {
                    attributes = JSON.parse(plant.attributes);
                    utilObject.convertIdsToObjectIds(attributes, callback);
                } else {
                    callback(undefined);
                }
            },
            function (callback) {
                //obtain plagues
                if (plant.plagues) {
                    plagues = JSON.parse(plant.plagues);
                    utilObject.convertIdsToObjectIds(plagues, callback);
                } else {
                    callback(undefined);
                }
            }
        ],
        function (err) {
            if (err) {
                return convertIdsCallback(err);
            }
            return convertIdsCallback(flavors, attributes, plagues);
        });
};

/**
 * Convert the MongoDB ObjectId to id
 * @param plant Plant
 * @param convertIdsFromMongoCallback
 */
var convertIdsFromMongo = function (plant, convertIdsFromMongoCallback) {

    var flavors = plant.flavors;
    var attributes = plant.attributes;
    var plagues = plant.plagues;
    var images = plant.images;

    async.series([
            function (callback) {
                if (plant) {
                    utilObject.convertItemId(plant, callback);
                } else {
                    callback(undefined);
                }
            },
            function (callback) {
                if (flavors) {
                    utilObject.convertItemsId(flavors, callback);
                } else {
                    callback(undefined);
                }
            },
            function (callback) {
                if (attributes) {
                    utilObject.convertItemsId(attributes, callback);
                } else {
                    callback(undefined);
                }
            },
            function (callback) {
                if (plagues) {
                    utilObject.convertItemsId(plagues, callback);
                } else {
                    callback(undefined);
                }
            },
            function (callback) {
                if (images) {
                    utilObject.convertItemsId(images, callback);
                } else {
                    callback(undefined);
                }
            }
        ],
        function (err) {
            if (err) {
                return convertIdsFromMongoCallback(err);
            }
            return convertIdsFromMongoCallback(undefined);
        });
};

var getPlantsByGardenId = function (gardenId, callback) {

    var filterPlants = [];

    Plant.find(function (err, plants) {
        if (err) {
            return callback(err);
        }

        for (var i = 0; i < plants.length; i++) {
            if (plants[i]._doc.gardenId.equals(gardenId)) {
                filterPlants.push(plants[i]);
            }
        }

        utilObject.convertItemsId(filterPlants, function () {
            convertPlantsIdsFromMongo(filterPlants, function (err) {
                if (err) {
                    return callback(err);
                }
                return callback(undefined, filterPlants);

            });
        });
    });
};

module.exports = {
    getPlantInfoById: getPlantInfoById,
    getResourcesIdsImagesForPlant: getResourcesIdsImagesForPlant,
    getPlantInfoByName: getPlantInfoByName,
    getPlantName: getPlantName,
    convertIds: convertIds,
    convertIdsFromMongo: convertIdsFromMongo,
    getPlantsByGardenId: getPlantsByGardenId,
    convertPlantsIdsFromMongo: convertPlantsIdsFromMongo
};