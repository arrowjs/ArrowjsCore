'use strict';

module.exports = function getData() {
    let w;
    let widgets = __.getOverrideCorePath(__base + "core/widgets/*/*.js", __base + "app/widgets/*/*.js", 2);
    w = [];

    for (let index in widgets) {
        if (widgets.hasOwnProperty(index)) {
            let Widget = require(widgets[index]);
            w.push(new Widget());
        }
    }

    global.__widget = w;
    return w;
};