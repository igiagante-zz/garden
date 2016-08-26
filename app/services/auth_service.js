/**
 * Created by igiagante on 29/7/16.
 */

var jwt = require('jwt-simple'),
    moment = require('moment'),
    auth = require('../../config/auth'),
    User = require('../models/user');

var isUserAuthenticated = function (token, isUserAuthenticatedCallback) {

    var payload = jwt.decode(token, auth.secret);

    if(payload.exp <= moment().unix()) {
        return res.status(401).send({message: "The token has expired"});
    }

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