"use strict";

module.exports = {
    name : 'link_to',
    handler : function (name,option) {
        let route = this._arrRoutes[name];
        if(option) {
            Object.keys(option).map(function (key) {
                let newKey = key;
                if (key[0] !== ":") {
                    newKey = ":" + key;
                }
                route = route.replace(newKey,option[key]);
            });
        }
        return route;
    }
};