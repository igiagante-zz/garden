/**
 * @author Ignacio Giagante, on 8/6/16.
 */

"use strict";

var async = require('async'),
    connection = require('../../config/connection');

/**
 * Add domain to the paths' images
 * @param items
 * @param callbackExposeImages
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
        if (doc.hasOwnProperty("url")) {
            doc.url = connection.domain + item.url;
        }
        if (doc.hasOwnProperty("thumbnailUrl")) {
            doc.thumbnailUrl = connection.domain + item.thumbnailUrl;
        }
    }
    callback();
};

/**
 * Add domain to the images resources
 * @param nutrients - List of nutrients
 * @param exposeImagesPathFromPlantCallback - Callback
 */
var exposeImagesPathFromNutrients = function (nutrients, exposeImagesPathFromPlantCallback) {

    for (var i = 0; i < nutrients.length; i++) {

        var nutrient = nutrients[i];
        var images = nutrient.images;

        for (var j = 0; j < images.length; j++) {
            var image = images[j];
            image.url = connection.domain + image.url;
            image.thumbnailUrl = connection.domain + image.thumbnailUrl;
        }
    }
    return exposeImagesPathFromPlantCallback(undefined);
};

/**
 * Add domain to the images resources
 * @param plants - List of plants
 * @param exposeImagesPathFromPlantCallback - Callback
 */
var exposeImagesPathFromPlant = function (plants, exposeImagesPathFromPlantCallback) {

    for (var i = 0; i < plants.length; i++) {

        var plant = plants[i];
        var images = plant.images;

        for (var j = 0; j < images.length; j++) {
            var image = images[j];
            image.url = connection.domain + image.url;
            image.thumbnailUrl = connection.domain + image.thumbnailUrl;
        }

        var flavors = plant.flavors;

        for (var d = 0; d < flavors.length; d++) {
            var flavor = flavors[d];
            flavor.imageUrl = connection.domain + flavor.imageUrl;
        }

        var plagues = plant.plagues;

        for (var k = 0; k < plagues.length; k++) {
            var plague = plagues[k];
            plague.imageUrl = connection.domain + plague.imageUrl;
        }
    }
    return exposeImagesPathFromPlantCallback(undefined);
};

module.exports = {
    exposeImages: exposeImages,
    exposeImagesPathFromPlant: exposeImagesPathFromPlant,
    exposeImagesPathFromNutrients: exposeImagesPathFromNutrients
};