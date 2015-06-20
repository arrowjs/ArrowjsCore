"use strict";

var slug = require('slug');

module.exports = function (env) {
    env.addFilter('slug', function (input) {
        if (input != null)
            return slug(input);
        else
            return '';
    });
};
