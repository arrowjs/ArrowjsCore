"use strict";

/**
 * Support make link base route name
 * @type {{name: string, handler: Function}}
 */
module.exports = {
    handler : function (name,option) {
        let route = this._arrRoutes[name];
        route = route.replace(/\((.)*\)/, '');
        if(option) {
            Object.keys(option).map(function (key) {
                let newKey = key;
                key[0] !== ":" && (newKey = ":" + key);
                route = route.replace(newKey,option[key]);
            });
        }
        return route;
    }
};