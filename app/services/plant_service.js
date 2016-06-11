"use strict";

var Plant = require('../models/plant.js'),
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
 * Get plant's info using name
 * @param plantId
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

    Plant.findById(plantId, function (error, plant) {
        if (error) {
            console.log('The plant wasn\'t found');
            console.log(error);
            return getPlantCallback(error);
        }
        getPlantCallback(undefined, plant.name);
    });
};

/**
 * Convert the ids to MongoDB ObjectId
 * @param req request
 * @param convertIdsCallback
 */
var convertIds = function (req, convertIdsCallback) {

    var flavors, attributes, plagues;

    async.series([
            function (callback) {
                //obtain flavors
                flavors = JSON.parse(req.body.flavors);
                utilObject.convertIdsToObjectIds(flavors, callback);
            },
            function (callback) {
                //obtain attributes
                attributes = JSON.parse(req.body.attributes);
                utilObject.convertIdsToObjectIds(attributes, callback);
            },
            function (callback) {
                //obtain plagues
                plagues = JSON.parse(req.body.plagues);
                utilObject.convertIdsToObjectIds(plagues, callback);
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
 * Convert the ids to MongoDB ObjectId
 * @param plant Plant
 * @param convertIdsCallback
 */
var convertIdsFromMongo = function (plant, convertIdsFromMongoCallback) {

    var flavors = plant.flavors;
    var attributes = plant.attributes;
    var plagues = plant.plagues;

    async.series([
            function (callback) {
                utilObject.convertItemsId(flavors, callback);
            },
            function (callback) {
                utilObject.convertItemsId(attributes, callback);
            },
            function (callback) {
                utilObject.convertItemsId(plagues, callback);
            }
        ],
        function (err) {
            if (err) {
                return convertIdsFromMongoCallback(err);
            }
            return convertIdsFromMongoCallback(undefined);
        });
};

module.exports = {
    getPlantInfoById: getPlantInfoById,
    getPlantInfoByName: getPlantInfoByName,
    getPlantName: getPlantName,
    convertIds: convertIds,
    convertIdsFromMongo: convertIdsFromMongo
};