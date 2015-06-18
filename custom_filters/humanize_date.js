"use strict";

let moment = require('moment');
moment.locale('vn');
moment.locale('en', {
    relativeTime : {
        future: "trong %s",
        past:   "%s trước",
        s:  "giây",
        m:  "1 phút",
        mm: "%d phút",
        h:  "1 tiếng",
        hh: "%d tiếng",
        d:  "1 ngày",
        dd: "%d ngày",
        M:  "1 tháng",
        MM: "%d tháng",
        y:  "1 năm",
        yy: "%d năm"
    }
});
module.exports = function (env) {
    env.addFilter('humanize_date', function (input) {
        return moment(input).fromNow();
    });
};
