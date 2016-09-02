/**
 * Created by igiagante on 12/8/16.
 */

"use strict";

var User = require('../models/user');


var addGardenIdToUser = function (userId, gardenId, addGardenIdToUserCallback) {

    User.findOne({_id: userId}, function (err, user) {
        if (err) {
            return addGardenIdToUserCallback(err);
        }

        if(user._doc && user._doc.gardensIds) {
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

module.exports = {
    addGardenIdToUser: addGardenIdToUser,
    removeGardenIdFromUser: removeGardenIdFromUser
};
