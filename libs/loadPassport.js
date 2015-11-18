'use strict';
let fs = require('fs');
let passport = require("passport");
let __ = require('./global_function');
let path = require('path');

module.exports = function loadPassport(setting) {
    let app = this;
    let passportConfig = require(__base + 'config/passport.js')(passport, app);
    if (setting && setting.passport) {
        app.use(passport.initialize());
        app.use(passport.session());

        __.getGlobbedFiles(app.arrFolder + 'config/strategies/**/*.js').forEach(function (strategy) {
            require(path.resolve(strategy))(passport,app.getConfig(), app);
        });
        passport.serializeUser(passportConfig.serializeUser);
        passport.deserializeUser(passportConfig.deserializeUser) ;
    }

    app.passportSetting  = passportConfig;
    app.passport  = passport;

};
