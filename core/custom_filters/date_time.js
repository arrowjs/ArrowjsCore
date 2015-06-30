"use strict";

//todo: hoi anh thanh
module.exports = function (env) {
    env.addFilter('date_time', function (input) {
        if (input != '') {
            let func = env.getFilter('date');
            return func(input, __config.date_format);
        } else {
            return "";
        }
    });
};
