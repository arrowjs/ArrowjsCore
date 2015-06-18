"use strict";

/** Strip tags */
module.exports = function (env) {
    env.addFilter('strip_tags', __utils.strip_tags);
};
