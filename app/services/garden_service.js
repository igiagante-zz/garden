/**
 * Created by igiagante on 6/7/16.
 */

'use strict';

var PlantService = require('../../app/services/plant_service'),
    async = require('async');

/**
 * Get all the gardens with their plants
 * @param List of gardens
 * @param getGardensWithPlantsCallback
 */
var addPlantsToGardens = function (gardens, getGardensWithPlantsCallback) {

    addPlants(gardens, function (err) {
        if (err) {
            return getGardensWithPlantsCallback(err);
        }
        return getGardensWithPlantsCallback(undefined);
    });
};

/**
 * Add plants to the garden
 * @param gardens
 * @param addPlantsCallback
 */
var addPlants = function (gardens, addPlantsCallback) {

    async.each(gardens, function (garden, callback) {

        PlantService.getPlantsByGardenId(garden._doc.id, function (err, plants) {
            if (err) {
                callback(err);
            }
            garden._doc.plants = plants;
            callback(undefined, garden);
        });

    }, function (err) {
        if (err) {
            return addPlantsCallback(err);
        }
        return addPlantsCallback(undefined);
    });
};

module.exports = {
    addPlantsToGardens: addPlantsToGardens
};
