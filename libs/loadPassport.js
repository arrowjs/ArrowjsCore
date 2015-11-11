'use strict';
let fs = require('fs');
let passport = require("passport");
let __ = require('./global_function');
let path = require('path');

module.exports = function loadPassport(application) {
    let app = this;

    app.use(passport.initialize());
    app.use(passport.session());

    fs.accessSync(app.arrFolder + 'config/passport.js');
    __.getGlobbedFiles(app.arrFolder + 'config/strategies/**/*.js').forEach(function (strategy) {
        require(path.resolve(strategy))(passport,application.arrConfig, application._arrApplication);
    });
    let passportConfig = require(app.arrFolder + 'config/passport.js')(passport, application._arrApplication);
    passport.serializeUser(passportConfig.serializeUser);
    passport.deserializeUser(passportConfig.deserializeUser) ;
    application._arrApplication.passportSetting  = passportConfig;
    application._arrApplication.passport  = passport;

};
