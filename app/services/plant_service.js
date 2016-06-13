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
                if(req.body.flavors) {
                    flavors = JSON.parse(req.body.flavors);
                    utilObject.convertIdsToObjectIds(flavors, callback);
                } else {
                    callback(undefined);
                }
            },
            function (callback) {
                //obtain attributes
                if(req.body.attributes) {
                    attributes = JSON.parse(req.body.attributes);
                    utilObject.convertIdsToObjectIds(attributes, callback);
                } else {
                    callback(undefined);
                }
            },
            function (callback) {
                //obtain plagues
                if(req.body.plagues) {
                    plagues = JSON.parse(req.body.plagues);
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
 * Convert the ids to MongoDB ObjectId
 * @param plant Plant
 * @param convertIdsFromMongoCallback
 */
var convertIdsFromMongo = function (plant, convertIdsFromMongoCallback) {

    var flavors = plant.flavors;
    var attributes = plant.attributes;
    var plagues = plant.plagues;

    async.series([
            function (callback) {
                if(flavors) {
                    utilObject.convertItemsId(flavors, callback);
                } else {
                    callback(undefined);
                }

            },
            function (callback) {
                if(attributes) {
                    utilObject.convertItemsId(attributes, callback);
                } else {
                    callback(undefined);
                }
            },
            function (callback) {
                if(plagues) {
                    utilObject.convertItemsId(plagues, callback);
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

module.exports = {
    getPlantInfoById: getPlantInfoById,
    getPlantInfoByName: getPlantInfoByName,
    getPlantName: getPlantName,
    convertIds: convertIds,
    convertIdsFromMongo: convertIdsFromMongo
};