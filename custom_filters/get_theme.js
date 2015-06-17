"use strict"
/**
 * Created by thanhnv on 2/28/15.
 */
let config = require(__base + 'config/config.js');
let fs = require('fs');
module.exports = function (env) {
    env.addFilter('get_theme', function (name) {
        let theme_path = __base + 'app/frontend/themes/' + config.themes + "/" + name;
        if (!fs.existsSync(theme_path)) {
            return 'default/' + name;
        }
        else {
            return config.themes + "/" + name;
        }

    });
}
