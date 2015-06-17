"use strict"
/**
 * Created by thanhnv on 2/28/15.
 */

module.exports = function (env) {
    env.addFilter('json_decode', function (data) {
        return JSON.parse(data);
    });
}
