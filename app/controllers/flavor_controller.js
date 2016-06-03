/**
 * @author Ignacio Giagante, on 27/5/16.
 */

var Flavor = require('../models/flavor');

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
        return res.json(flavors);
        //return exposeImagesPath(flavors, res);
    });
};

var exposeImagesPath = function(flavors, res) {

    for(var i = 0; i < flavors.length; i++) {

        var flavor = flavors[i];
        flavor.imageUrl = "http://10.18.32.137:3000" + flavor.imageUrl;
    }
    return res.json(flavors);
};


module.exports = {
    getAll: getAll
};
