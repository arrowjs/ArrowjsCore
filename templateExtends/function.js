"use strict";

module.exports = {
    t : t,
    link_to : function (name,option) {
        let route = this._arrRoutes[name];
        Object.keys(option).map(function (key) {
            let newKey = key;
            if (key[0] !== ":") {
                newKey = ":" + key;
            }
            route = route.replace(newKey,option[key]);
        });
        return route;
    }
};