/**
 * @author Ignacio Giagante, on 3/6/16.
 */


var Attribute = require('../models/attribute'),
    utilObject = require('../commons/util_object');

/**
 * Get all the attributes
 * @param req
 * @param res
 */
var getAll = function (req, res) {
    Attribute.find(function (err, attributes) {
        if (err) {
            res.send(err);
        }
        utilObject.convertItemsId(attributes, function() {
            return res.json(attributes);
        });
    });
};

module.exports = {
    getAll: getAll
};

