/**
 * Created by igiagante on 29/7/16.
 */

var jwt = require('jwt-simple'),
    auth = require('../../config/auth'),
    User = require('../models/user');

var isUserAuthenticated = function (token, isUserAuthenticatedCallback) {

    var payload = jwt.decode(token, auth.secret);

    User.findOne({
        _id: payload.sub
    }, function (err, user) {

        if (err) {
            return isUserAuthenticatedCallback(err);
        }
        return isUserAuthenticatedCallback(undefined, user);
    });
};

module.exports = {
    isUserAuthenticated: isUserAuthenticated
};