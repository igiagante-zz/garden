/**
 * @author Ignacio Giagante, on 1/4/16.
 */

"use strict";

var Irrigation = require('../models/irrigation'),
    Dose = require('../models/dose'),
    async = require('async'),
    logger = require('../utils/logger'),
    utilObject = require('../commons/util_object'),
    doseService = require('./dose_service'),
    Nutrient = require('../models/nutrient');


/**
 * Get all the irrigation for one garden
 * @param gardenId
 * @param callback
 */
var getIrrigationsByGardenId = function(gardenId, callback) {

    var filterIrrigations = [];

    Irrigation.find(function (err, irrigations) {
        if (err) {
            return callback(err);
        }

        for(var i = 0; i < irrigations.length; i++){
            if(irrigations[i]._doc.gardenId.equals(gardenId)) {
                filterIrrigations.push(irrigations[i]);
            }
        }

        doseService.addDoses(filterIrrigations, function (err) {
            if (err) {
                return callback(err);
            }
            utilObject.convertItemsId(filterIrrigations, function () {
                return callback(undefined, filterIrrigations);
            });
        });
    });
};


/**
 * Get all the irrigation for one garden
 * @param garden_id The garden id
 * @param fromDate
 * @param toDate
 * @param callback
 */
var getIrrigations = function(garden_id, fromDate, toDate, callback) {

    logger.debug('Get all the irrigations for one garden');

    var irrigationsOut = [];

    Irrigation.find({ "gardenId" : garden_id}, function(err, irrigations){
        if(err) {
            callback(err);
        }

        for (var i = 0; i < irrigations.length; i++) {
            irrigationsOut.push({
                    _id: irrigations[i]._id,
                    irrigationDate: irrigations[i].irrigationDate,
                    quantity: irrigations[i].quantity,
                    gardenId: irrigations[i].gardenId,
                    doseId: irrigations[i].doseId
                }
            );
        }
        callback(undefined, irrigationsOut);
    });
};

/**
 * Get dose data
 * @param doses_Id
 * @param callback
 */
var readDose = function(doses_Id, callback){

    var doseOut = {};

    Dose.find({ "doseId" : doses_Id}, function(err, dose){
        if(err) {
            callback(err);
        }

        doseOut.water = dose.water;
        doseOut.phDose = dose.phDose;
        doseOut.ec = dose.ec;
        doseOut.ph = dose.ph;
        doseOut.nutrients = dose.nutrients;

        callback(undefined, doseOut);
    });
};

/**
 * Get all the doses from all irrigations
 * @param irrigations
 * @param callback
 */
var getDoses = function(irrigations, callback) {

    logger.debug('Get all the doses from irrigations');

    var dosesIds = [];

    for (var i = 0; i < irrigations.length; i++) {
        dosesIds.push(irrigations[i].doseId);
    }

    async.concat(dosesIds, readDose, function(err, doses){
        if(err) {
            return callback(err);
        }
        callback(undefined, doses);
    });
};

/**
 * Get nutrients used in one dose
 * @param doses
 * @param callback
 */
var getNutrientsFromDoses = function(doses, callback) {

    logger.debug('Get the nutrients from each dose');

    var nutrients = [];

    for (var i = 0; i < doses.length; i++) {
        nutrients.push(doses[i].nutrients);
    }

    callback(undefined, nutrients);
};

/**
 * Sum all the quantity's nutrients used by doses
 * @param nutrients
 * @param callback
 */
var getNutrientsTotal = function(nutrients, callback) {

    logger.debug('Get nutrients info');

    //only nutrient info
    var nutrientsOut = [];

    Nutrient.find(function(err, nutrients) {
        if (err) {
            return callback(err);
        }
        nutrientsOut = nutrients;
    });

    var mapOfNutrients = []; // create an empty array

    //init nutrients map
    for (var a = 0; a < nutrientsOut.length; i++) {
        mapOfNutrients.push({
            key: nutrientsOut[a].name,
            value: 0
        });
    }

    //accumulate use of each nutrient
    for (var i = 0; i < nutrients.length; i++) {
        for (var j = 0; j < nutrientsOut.length; j++) {
            if(nutrients[i].name === nutrients[j].name) {
                mapOfNutrients[nutrients[i].name] += nutrients[i].quantityUsed;
            }
        }
    }

    callback(undefined, mapOfNutrients);
};


/**
 * Calculate the use of nutrients during one period of time for one garden.
 * @param gardenId The garden Id
 * @param fromDate
 * @param toDate
 * @param mainCallback
 */
var calculateUseOfNutrients = function(gardenId, fromDate, toDate, mainCallback) {

    var flow = {

        getIrrigations: async.apply(getIrrigations, gardenId, fromDate, toDate),

        getDoses: ['getIrrigations', async.apply(getDoses)],

        getNutrientsFromDoses: ['getDoses', async.apply(getNutrientsFromDoses)],

        getNutrientsTotal: ['getNutrientsFromDoses', async.apply(getNutrientsTotal)]

    };

    async.auto(flow, function (error, results) {
        if (error) {
            return mainCallback(error);
        }
        mainCallback(undefined, results);
    });
};

module.exports = {
    calculateUseOfNutrients : calculateUseOfNutrients,
    getIrrigationsByGardenId: getIrrigationsByGardenId
};


