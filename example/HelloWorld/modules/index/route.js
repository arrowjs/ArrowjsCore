'use strict';

module.exports = function (route,component,application) {
    route.route("/")
        .get(component.controllers.get);
};