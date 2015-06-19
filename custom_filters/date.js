"use strict";

let utils = require(__base + 'core/libs/utils'),
    dateFormatter = require(__base + 'core/libs/dateformatter');

module.exports = function (env) {
    env.addFilter('date', function (input, format, offset, abbr) {
        let l = format.length,
            date = new dateFormatter.DateZ(input),
            cur,
            i = 0,
            out = '';

        if (offset) {
            date.setTimezoneOffset(offset, abbr);
        }

        for (i; i < l; i += 1) {
            cur = format.charAt(i);
            if (dateFormatter.hasOwnProperty(cur)) {
                out += dateFormatter[cur](date, offset, abbr);
            } else {
                out += cur;
            }
        }
        return out;
    });
};
