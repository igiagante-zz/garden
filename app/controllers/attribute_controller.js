/**
 * @author Ignacio Giagante, on 3/6/16.
 */


var Attribute = require('../models/attribute'),
    attributeService = require('../services/attributes_service'),
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

var getAttributesMock = function (req, res) {

    attributeService.getAttributesData(function (attrs){
       return res.status(200).send(attrs);
    });
};

module.exports = {
    getAll: getAll,
    getAttributesMock: getAttributesMock
};

