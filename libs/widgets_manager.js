'use strict';

module.exports = function () {
    let w = [];

    let widgets =__.getOverrideCorePath(__base + "core/widgets/*/*.js", __base + "app/widgets/*/*.js", 2);

    for (let index in widgets) {
        if (widgets.hasOwnProperty(index)) {
            let Widget = require(widgets[index]);
            w.push(new Widget());
        }
    }

    return w;
};
