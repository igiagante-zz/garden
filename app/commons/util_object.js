/**
 * @author Ignacio Giagante, on 8/6/16.
 */

"use strict";

var async = require('async'),
    mongoose = require('mongoose'),
    ObjectID = mongoose.Types.ObjectId;

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
 * Convert the property _id to id
 * @param item
 * @param callback
 */
var convertItemId = function (item, callback) {

    if (item && item.hasOwnProperty("_doc")) {
        var doc = item._doc;
        if (doc.hasOwnProperty("_id")) {
            item._doc.id = item._doc._id;
            delete item._doc._id;
        }
    }
    callback();
};

/**
 * Convert the property id to ObjectId in each item from a list
 * @param items
 * @param callbackItems
 */
var convertIdsToObjectIds = function (items, callbackItems) {

    async.each(items, function (item, callback) {
        convertIdToObjectId(item, callback);
    }, function (err) {
        if (err) {
            return callbackItems(err);
        }
        callbackItems(undefined);
    });
};


/**
 * Convert the property id to ObjectId
 * @param item
 * @param callback
 */
var convertIdToObjectId = function (item, callback) {

    if (item && item.hasOwnProperty("id")) {
        item._id = ObjectID(item.id);
    }
    callback();
};

module.exports = {
    convertItemId: convertItemId,
    convertItemsId: convertItemsId,
    convertIdToObjectId: convertIdToObjectId,
    convertIdsToObjectIds: convertIdsToObjectIds
};