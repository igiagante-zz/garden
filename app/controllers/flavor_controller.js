/**
 * @author Ignacio Giagante, on 27/5/16.
 */

var Flavor = require('../models/flavor');

/**
 * Get all the plants
 * @param req
 * @param res
 */
var getAll = function (req, res) {
    Flavor.find(function (err, flavors) {
        if (err) {
            res.send(err);
        }
        res.json(flavors);
    });
};

module.exports = {
    getAll: getAll
};
