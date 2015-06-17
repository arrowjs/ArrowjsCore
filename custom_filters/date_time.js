"use strict"
/**
 * Created by thanhnv on 2/28/15.
 */
let config = require(__base + 'config/config');
module.exports = function (env) {
    env.addFilter('date_time', function (input) {
        if(input!=''){
            let func = env.getFilter('date');
            return func(input, config.date_format);
        }
        else{
            return "";
        }

    });
}
