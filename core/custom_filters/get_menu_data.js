"use strict";

module.exports = function (env) {
    env.addFilter('get_menu_data', function (id, _menus_data) {
        for (let i in _menus_data) {
            if (id == _menus_data[i].id) {
                return _menus_data[i];
            }
        }
    });
};
