/**
 * Created by igiagante on 3/6/16.
 */


var Attribute = require('../models/attribute');

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
        return res.json(attributes);
    });
};

module.exports = {
    getAll: getAll
};

