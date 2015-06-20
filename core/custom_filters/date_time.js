"use strict";

let config = require(__base + 'config/config');

//todo: hoi anh thanh
module.exports = function (env) {
    env.addFilter('date_time', function (input) {
        if (input != '') {
            let func = env.getFilter('date');
            return func(input, config.date_format);
        } else {
            return "";
        }
    });
};
