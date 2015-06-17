"use strict"
/**
 * Created by thanhnv on 2/28/15.
 */

module.exports = function (env) {
    env.addFilter('check_state', function (rules, moduleName, action) {
        for (let i in rules) {
            if (i == moduleName) {
                let arr_actions = rules[i].split(':');
                if (arr_actions.indexOf(action) > -1) {
                    return 'checked';
                }
            }
        }
        return '';
    });
};
