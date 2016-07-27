/**
 * @author Ignacio Giagante, on 6/4/16.
 */

"use strict";

module.exports = {
    db: {
        production: "mongodb://user:pass@example.com:1234/garden-prod",
        development: "mongodb://localhost:27017/garden-dev",
        test: "mongodb://localhost:27017/garden-test"
    },

    connection: {
        domain: "http://10.18.33.67:3000"
    }
};