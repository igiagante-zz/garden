/**
 * @author Ignacio Giagante, on 8/6/16.
 */

"use strict";

var async = require('async'),
    config = require('../../config');

/**
 * Add domain to the paths' images
 * @param items
 * @param callbackItems
 */
var exposeImages = function (items, callbackExposeImages) {

    async.each(items, function (item, callback) {
        _exposeOneImage(item, callback);
    }, function (err) {
        if (err) {
            return callbackExposeImages(err);
        }
        callbackExposeImages(undefined);
    });
};


/**
 * Add domain to the image's path
 * @param item
 * @param callback
 */
var _exposeOneImage = function (item, callback) {

    if (item.hasOwnProperty("_doc")) {
        var doc = item._doc;
        if (doc.hasOwnProperty("imageUrl")) {
            doc.imageUrl = config.connection.domain + item.imageUrl;
        }
    }
    callback();
};

/**
 * Add domain to the images resources
 * @param plants - List of plants
 * @param res - Response
 */
var exposeImagesPathFromPlant = function (plants, res) {

    for (var i = 0; i < plants.length; i++) {

        var plant = plants[i];
        var images = plant.images;

        for (var j = 0; j < images.length; j++) {
            var image = images[j];
            image.url = config.connection.domain + image.url;
            image.thumbnailUrl = config.connection.domain + image.thumbnailUrl;
        }

        var flavors = plant.flavors;

        for (var d = 0; d < flavors.length; i++) {
            var flavor = flavors[d];
            flavor.imageUrl = config.connection.domain + flavor.imageUrl;
        }

        var plagues = plant.plagues;

        for (var k = 0; k < plagues.length; k++) {
            var plague = plagues[k];
            plague.imageUrl = config.connection.domain + plague.imageUrl;
        }

    }
    return res.json(plants);
};

module.exports = {
    exposeImages: exposeImages,
    exposeImagesPathFromPlant: exposeImagesPathFromPlant
};