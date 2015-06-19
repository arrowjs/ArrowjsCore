'use strict';
/**
 * Created by thanhnv on 2/23/15.
 */
let menus = {};
module.exports = function () {
    // Main Navigation group
    menus.default = {
        title: 'Main Navigation',
        sort: 1,
        modules: {}
    };

    // System group
    menus.systems = {
        title: 'Systems',
        sort: 2,
        modules: {}
    };

    // Sorting menu
    menus.sorting = {};
    menus.sorting.default = [
        //"dashboard",
        "blog"
        //"logs"
    ];
    menus.sorting.systems = [
        "users",
        "roles",
        "menus",
        "widgets",
        "modules",
        "plugins",
        "configurations"
    ];

    return menus;
};

