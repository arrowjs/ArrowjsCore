"use strict";

// Get odd value
module.exports = function (env) {
    env.addFilter('odd', function (value) {
        return parseFloat(value) % 2 > 0;
    });
};
