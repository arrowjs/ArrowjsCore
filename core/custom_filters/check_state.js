"use strict";

module.exports = function (env) {
    env.addFilter('check_state', function (rules, moduleName, action) {
        for (let i in rules) {
            if (rules.hasOwnProperty(i) && i == moduleName) {
                let arr_actions = rules[i].split(':');
                if (arr_actions.indexOf(action) > -1) {
                    return 'checked';
                }
            }
        }
        return '';
    });
};
