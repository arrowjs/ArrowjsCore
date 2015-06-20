"use strict";

module.exports = function (env) {
    env.addFilter('json_decode', function (data) {
        return JSON.parse(data);
    });
};
