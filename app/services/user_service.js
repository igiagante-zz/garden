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

module.exports = {
    addGardenIdToUser: addGardenIdToUser
};
