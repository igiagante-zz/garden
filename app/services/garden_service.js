/**
 * @author Ignacio Giagante, on 6/7/16.
 */

'use strict';

var plantService = require('./plant_service'),
    irrigationService = require('./irrigation_service'),
    Garden = require('../models/garden'),
    utilObject = require('../commons/util_object'),
    plantService = require('../../app/services/plant_service'),
    async = require('async');

/**
 * Get all the gardens with their plants
 * @param gardens List of gardens
 * @param addPlantsToGardensCallback
 */
var addPlantsToGardens = function (gardens, addPlantsToGardensCallback) {

    addPlants(gardens, function (err) {
        if (err) {
            return addPlantsToGardensCallback(err);
        }
        return addPlantsToGardensCallback(undefined);
    });
};

/**
 * Add plants to the garden
 * @param gardens
 * @param addPlantsCallback
 */
var addPlants = function (gardens, addPlantsCallback) {

    async.each(gardens, function (garden, callback) {

        addPlantsToOneGarden(garden, callback);

    }, function (err) {
        if (err) {
            return addPlantsCallback(err);
        }
        return addPlantsCallback(undefined);
    });
};

var addPlantsToOneGarden = function (garden, addPlantsToOneGardenCallback) {
    plantService.getPlantsByGardenId(garden._doc.id, function (err, plants) {
        if (err) {
            return addPlantsToOneGardenCallback(err);
        }

        garden._doc.plants = plants;

        return addPlantsToOneGardenCallback(undefined, garden);
    });
};

/**
 * Get all the gardens with their irrigations
 * @param gardens
 * @param getGardensWithPlantsCallback
 */
var addIrrigationsToGardens = function (gardens, addIrrigationsToGardensCallback) {

    addIrrigationsToGarden(gardens, function (err) {
        if (err) {
            return addIrrigationsToGardensCallback(err);
        }
        return addIrrigationsToGardensCallback(undefined);
    });
};

/**
 * Add irrigations to the garden
 * @param gardens
 * @param addIrrigationsCallback
 */
var addIrrigationsToGarden = function (gardens, addIrrigationsCallback) {

    async.each(gardens, function (garden, callback) {

        addIrrigationsToOneGarden(garden, callback);

    }, function (err) {
        if (err) {
            return addIrrigationsCallback(err);
        }
        return addIrrigationsCallback(undefined);
    });
};

var addIrrigationsToOneGarden = function (garden, addIrrigationsToOneGardenCallback) {
    irrigationService.getIrrigationsByGardenId(garden._doc.id, function (err, irrigations) {
        if (err) {
            return addIrrigationsToOneGardenCallback(err);
        }
        garden._doc.irrigations = irrigations;
        return addIrrigationsToOneGardenCallback(undefined, garden);
    });
};

/**
 * Get all the data from all the gardens related to one user
 * @param gardensIds Embedded Documents which contain garden's ids
 * @param getGardensDataCallback
 */
var getGardensData = function (gardensIds, getGardensDataCallback) {

    var gardens = [];

    async.each(gardensIds, function (gardenId, callback) {

        Garden.findOne({"_id": gardenId._doc._id}, function (err, garden) {

            if (err) {
                return callback(err);
            }

            if (!garden) {
                return callback(undefined);
            }
            // convert _id to id -> fucking mongo
            utilObject.convertItemId(garden, function () {

                addPlantsToOneGarden(garden, function (err, garden) {
                    if (err) {
                        return callback(err);
                    }

                    addIrrigationsToOneGarden(garden, function (err) {
                        if (err) {
                            return callback(err);
                        }
                        gardens.push(garden);
                        return callback(undefined);
                    });
                });
            });
        });
    }, function (err) {
        if (err) {
            return getGardensDataCallback(err);
        }
        return getGardensDataCallback(undefined, gardens);
    });
};

var findGardenByName = function (gardenName, findGardenByNameCallback) {
    Garden.findOne({name: gardenName}, function (err, garden) {
        if (err) {
            return findGardenByNameCallback(err);
        }
        return findGardenByNameCallback(undefined, garden);
    });
};

/**
 * Get a garden
 * @param gardenId
 * * @param getGardenCallback
 */
var getGarden = function (gardenId, getGardenCallback) {

    Garden.findById(gardenId, function (err, garden) {
        if (err) {
            return getGardenCallback(err);
        }

        utilObject.convertItemId(garden, function () {

            addIrrigationsToOneGarden(garden, function (err) {
                if (err) {
                    return getGardenCallback(err);
                }

                plantService.getPlantsByGardenId(garden._doc.id, function (err, plants) {
                    if (err) {
                        return getGardenCallback(err);
                    }
                    garden._doc.plants = plants;
                    return getGardenCallback(undefined, garden);
                });
            });
        });
    });
};

module.exports = {
    addPlantsToGardens: addPlantsToGardens,
    addIrrigationsToGardens: addIrrigationsToGardens,
    addIrrigationsToOneGarden: addIrrigationsToOneGarden,
    getGardensData: getGardensData,
    findGardenByName: findGardenByName,
    getGarden: getGarden
};
