"use strict";

var Dose = require('models/dose'),
    logger = require('../utils/logger');

var doseService = {};

doseService.getDose = function (dose_id) {

    Dose.findById({"_id ": dose_id}, function (err, dose) {
        if (err) {
            logger.debug(err);
        }
        return dose;
    });
};

module.exports = doseService;