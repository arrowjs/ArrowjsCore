'use strict';

let config = require(__base + 'config/config');

module.exports = function () {
    let w = [];

    config.getGlobbedFiles(__base + "app/widgets/*/*.js").forEach(function (routePath) {
        let Widget = require(routePath);
        w.push(new Widget());
    });

    return w;
};
