/**
 * Created by igiagante on 12/8/16.
 */

"use strict";

var User = require('../models/user'),
    Garden = require('../models/garden'),
    fs = require('extfs'),
    mkdir = require('mkdir-p'),
    logger = require('../utils/logger'),
    async = require('async');

var publicFolderPath = process.cwd() + '/../public/users/';

var addGardenIdToUser = function (userId, gardenId, addGardenIdToUserCallback) {

    User.findOne({_id: userId}, function (err, user) {
        if (err) {
            return addGardenIdToUserCallback(err);
        }

        if(user._doc.gardensIds) {
            user._doc.gardensIds.push(gardenId);
        }

        user.save(function (err) {
            if (err) {
                return addGardenIdToUserCallback(err);
            }

            return addGardenIdToUserCallback(undefined, user);
        });
    });
};

var removeGardenIdFromUser = function (userId, gardenId, addGardenIdToUserCallback) {

    User.findOne({_id: userId}, function (err, user) {
        if (err) {
            return addGardenIdToUserCallback(err);
        }

        var gardensIds = user._doc.gardensIds;
        if(gardensIds) {
            var index = gardensIds.indexOf(gardenId);
            gardensIds.splice(index, 1);
        }

        user.save(function (err) {
            if (err) {
                return addGardenIdToUserCallback(err);
            }

            return addGardenIdToUserCallback(undefined, user);
        });
    });
};

var createUserPublicFolders = function (username, createUserPublicFoldersCallback) {

    var plantsPath = publicFolderPath + username + '/images/plants/';
    var nutrientsPath = publicFolderPath + username + '/images/nutrients/';

    var flow = {

        createPlantsFolder: function (callback) {
            fs.exists(plantsPath, function (exist) {
                if (!exist) {
                    mkdir(plantsPath, function (err) {
                        if (err) {
                            return createUserPublicFoldersCallback(err + plantsPath + ' could not be created');
                        }
                        logger.debug('directory created : ' + plantsPath);
                    });
                }
                callback(undefined, plantsPath);
            });
        },

        createNutrientsFolder: ['createPlantsFolder', function (callback) {
            fs.exists(nutrientsPath, function (exist) {
                if (!exist) {
                    mkdir(nutrientsPath, function (err) {
                        if (err) {
                            return createUserPublicFoldersCallback(err + nutrientsPath + ' could not be created');
                        }
                        logger.debug('directory created : ' + nutrientsPath);
                    });
                }
                callback(undefined, nutrientsPath);
            });
        }]
    };

    async.auto(flow, function (error, results) {
        if (error) {
            return createUserPublicFoldersCallback(error);
        }
        logger.debug('directories created: ' + results.createPlantsFolder + ' ' + results.createNutrientsFolder);
        createUserPublicFoldersCallback(undefined);
    });
};

var getUserByGardenId = function (gardenId, getUserByGardenIdCallback) {

    Garden.findOne({_id: gardenId}, function (err, garden) {
        if (err) {
            return getUserByGardenIdCallback(err);
        }

        User.findOne({_id: garden._doc.userId}, function (err, user) {
            if (err) {
                return getUserByGardenIdCallback(err);
            }
            return getUserByGardenIdCallback(undefined, user);
        });
    });
};

module.exports = {
    addGardenIdToUser: addGardenIdToUser,
    removeGardenIdFromUser: removeGardenIdFromUser,
    createUserPublicFolders: createUserPublicFolders,
    getUserByGardenId: getUserByGardenId
};
