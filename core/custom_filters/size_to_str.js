"use strict";

module.exports = function (env) {
    env.addFilter('size_to_str', function (bytes) {
        if (bytes != '') {
            if (bytes == 0) return '0 Byte';
            var k = 1000;
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
        } else {
            return 0;
        }
    });
};
