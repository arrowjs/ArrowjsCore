"use strict";

let SystemManager = require('./../manager/SystemManager');
let __ = require('../libs/global_function');

class WidgetManager extends SystemManager {
    constructor(app) {
        super(app);
        let widgets = __.getOverrideCorePath(__base + "core/widgets/*/*.js", __base + "app/widgets/*/*.js", 2);
        let w = [];
        for (let index in widgets) {
            if (widgets.hasOwnProperty(index)) {
                let Widget = require(widgets[index]);
                w.push(new Widget());
            }
        }

        this._widgets = w;
    }
}

module.exports = WidgetManager;