"use strict";

module.exports = function (app) {
    require('./core/route')(app);
    require('./index/route')(app);
    require('./blog/route')(app);
};
