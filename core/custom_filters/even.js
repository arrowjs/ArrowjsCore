"use strict";

// Get event value
module.exports = function (env) {
    env.addFilter('even', function (value) {
        return parseFloat(value) % 2 == 0;
    });
};
