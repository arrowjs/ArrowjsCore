
"use strict";

/**
 * Hàm mục đích kiểm tra một đối tượng được truyền vào có phải là null hay không
 */

var slug = require('slug');
module.exports = function (env) {
    env.addFilter('slug', function (input) {
        if (input != null)
            return slug(input);
        else
            return '';
    });
};
