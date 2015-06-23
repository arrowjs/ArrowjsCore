"use strict";

let fs = require('fs');

module.exports = function (env) {
    env.addFilter('get_theme', function (name) {
        let theme_path = __base + 'themes/frontend/' + __config.themes + "/" + name;

        if (!fs.existsSync(theme_path)) {
            return 'default/' + name;
        } else {
            return __config.themes + "/" + name;
        }
    });
};
