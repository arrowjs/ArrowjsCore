"use strict"
/**
 * Created by thanhnv on 2/28/15.
 */
var slug = require('slug');
module.exports = function (env) {
    env.addFilter('slug', function (input) {
        if (input != null)
            return slug(input);
        else
            return '';
    });
}
