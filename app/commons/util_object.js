/**
 * Created by igiagante on 8/6/16.
 */

var async = require('async');

"use strict";

/**
 * Convert the property _id to id in each item from a list
 * @param items
 * @param callbackItems
 */
var convertItemsId = function (items, callbackItems) {

    async.each(items, function (item, callback) {
        convertItemId(item, callback);
    }, function (err) {
        if (err) {
            return callbackItems(err);
        }
        callbackItems(undefined);
    });
};


/**
 * Convert the property _id to id in each item from a list
 * @param item
 * @param callback
 */
var convertItemId = function (item, callback) {

    if (item.hasOwnProperty("_doc")) {
        var doc = item._doc;
        if (doc.hasOwnProperty("_id")) {
            item._doc.id = item._doc._id;
            delete item._doc._id;
        }
    }
    callback();
};

module.exports = {
    convertItemId: convertItemId,
    convertItemsId: convertItemsId
};