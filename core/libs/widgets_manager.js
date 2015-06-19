'use strict';

module.exports = function () {
    let w = [];
    __config.getGlobbedFiles(__base + "widgets/*/*.js").forEach(function (routePath) {
        let Widget = require(routePath);
        w.push(new Widget());
    });

    return w;
};
