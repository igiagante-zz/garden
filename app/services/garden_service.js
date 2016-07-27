/**
 * @author Ignacio Giagante, on 6/7/16.
 */

'use strict';

var plantService = require('../../app/services/plant_service'),
    irrigationService = require('../../app/services/irrigation_service'),
    doseService = require('../../app/services/dose_service'),
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

        plantService.getPlantsByGardenId(garden._doc.id, function (err, plants) {
            if (err) {
                return callback(err);
            }
            garden._doc.plants = plants;
            return callback(undefined, garden);
        });

    }, function (err) {
        if (err) {
            return addPlantsCallback(err);
        }
        return addPlantsCallback(undefined);
    });
};

/**
 * Get all the gardens with their irrigations
 * @param gardens
 * @param getGardensWithPlantsCallback
 */
var addIrrigationsToGardens = function (gardens, addIrrigationsToGardensCallback) {

    addIrrigations(gardens, function (err) {
        if (err) {
            return addIrrigationsToGardensCallback(err);
        }
        return addIrrigationsToGardensCallback(undefined);
    });
};

/**
 * Add irrigations to the garden
 * @param gardens
 * @param addPlantsCallback
 */
var addIrrigations = function (gardens, addIrrigationsCallback) {

    async.each(gardens, function (garden, callback) {

        irrigationService.getIrrigationsByGardenId(garden._doc.id, function (err, irrigations) {
            if (err) {
                return callback(err);
            }

            doseService.addDose(irrigations, function (err) {
                if (err) {
                    return callback(err);
                }

                garden._doc.irrigations = irrigations;
                return callback(undefined, garden);
            });
        });

    }, function (err) {
        if (err) {
            return addIrrigationsCallback(err);
        }
        return addIrrigationsCallback(undefined);
    });
};

module.exports = {
    addPlantsToGardens: addPlantsToGardens,
    addIrrigationsToGardens: addIrrigationsToGardens
};
