'use strict';

module.exports = function () {
    let w = [];
    __config.getGlobbedFiles(__base + "app/widgets/*/*.js").forEach(function (routePath) {
        let Widget = require(routePath);
        w.push(new Widget());
    });

    return w;
};
