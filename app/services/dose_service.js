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
var addDose = function (irrigations, addDoseCallback) {

    async.each(irrigations, function (irrigation, callback) {

        getDoseById(irrigation._doc.doseId, function (err, dose) {
            if (err) {
                return callback(err);
            }
            irrigation._doc.dose = dose;
            return callback(undefined, irrigation);
        });

    }, function (err) {
        if (err) {
            return addDoseCallback(err);
        }
        return addDoseCallback(undefined);
    });
};

module.exports = {
    addDose: addDose
};