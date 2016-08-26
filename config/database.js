/**
 * @author Ignacio Giagante, on 28/7/16.
 */

"use strict";

module.exports = {
    db: {
        //production: "mongodb://user:pass@example.com:1234/garden-prod",
        production: "mongodb://localhost:27017/garden-prod",
        development: "mongodb://localhost:27017/garden-dev",
        test: "mongodb://localhost:27017/garden-test"
    }
};
