"use strict";

var Dose = require('../models/dose'),
    async = require('async'),
    logger = require('../utils/logger');

var getDoseById = function (doseId, getDoseByIrrigationIdCallback) {

    Dose.findById({"_id": doseId}, function (err, dose) {
        if (err) {
            logger.debug(err);
            return getDoseByIrrigationIdCallback(err);
        }
        return getDoseByIrrigationIdCallback(undefined, dose);
    });
};

/**
 * Add doses to irrigations
 * @param irrigations
 * @param addDoseCallback
 */
var addDoses = function (irrigations, addDoseCallback) {

    async.each(irrigations, function (irrigation, callback) {

        addDoseToIrrigation(irrigation, callback);

    }, function (err) {
        if (err) {
            return addDoseCallback(err);
        }
        return addDoseCallback(undefined);
    });
};

/**
 * Add dose to one irrigation
 * @param irrigation
 * @param addDoseCallback
 */
var addDoseToIrrigation = function (irrigation, addDoseCallback) {

    getDoseById(irrigation._doc.doseId, function (err, dose) {
        if (err) {
            return addDoseCallback(err);
        }
        irrigation._doc.dose = dose;
        delete irrigation._doc.dose._doc._id;
        return addDoseCallback(undefined, irrigation);
    });
};

module.exports = {
    addDoseToIrrigation: addDoseToIrrigation,
    addDoses: addDoses
};