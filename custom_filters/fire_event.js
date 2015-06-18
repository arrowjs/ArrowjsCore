"use strict";

let event = require(__base + 'libs/event_manager');
module.exports = function (env) {
    env.addFilter('fire_event', function (input, data, cb) {
        event.fire_event(input, data, cb);
    }, true);
};
