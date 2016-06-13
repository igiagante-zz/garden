/**
 * @author Ignacio Giagante, on 27/5/16.
 */

var Flavor = require('../models/flavor'),
    utilObject = require('../commons/util_object'),
    utilImage = require('../commons/util_image');

/**
 * Get all the flavors
 * @param req
 * @param res
 */
var getAll = function (req, res) {
    Flavor.find(function (err, flavors) {
        if (err) {
            res.send(err);
        }
        utilObject.convertItemsId(flavors, function() {
            utilImage.exposeImages(flavors, function () {
                return res.json(flavors);
            });
        });
    });
};

module.exports = {
    getAll: getAll
};
