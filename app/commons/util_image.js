/**
 * @author Ignacio Giagante, on 8/6/16.
 */

"use strict";

var async = require('async');

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
            doc.imageUrl = "http://10.18.32.137:3000" + item.imageUrl;
        }
    }
    callback();
};

module.exports = {
    exposeImages: exposeImages
};