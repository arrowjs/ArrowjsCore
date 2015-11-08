'use strict';

module.exports = function (route,component,application) {
    route.route("/").get(component.controllers.index);

    route.route("/about").get(component.controllers.about);
};