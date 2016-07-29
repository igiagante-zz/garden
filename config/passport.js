var JwtStrategy = require('passport-jwt').Strategy;

// load up the user model
var User = require('../app/models/user');
var auth = require('../config/auth');
var passport = require('passport');

module.exports = function() {
    var opts = {};
    opts.secretOrKey = auth.secret;
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        User.findOne({id: jwt_payload.id}, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        });
    }));
};