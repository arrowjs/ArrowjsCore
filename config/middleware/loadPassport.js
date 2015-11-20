'use strict';
let fs = require('fs');
let passport = require("passport");
let __ = require('../../libs/global_function');
let path = require('path');

/**
 * Use middleware passport
 * @param setting: user setting defined in server.js in root folder of Arrowjs application
 */
module.exports = function loadPassport(setting) {
    let app = this;
    let passportConfig = require(__base + 'config/passport.js')(passport, app);
    //If passport is enabled then load its
    if (setting && setting.passport) {
        app.use(passport.initialize());
        app.use(passport.session());

        //Read and load all configuration js files in config/strategies
        __.getGlobbedFiles(app.arrFolder + 'config/strategies/**/*.js').forEach(function (strategy) {
            require(path.resolve(strategy))(passport,app.getConfig(), app);
        });
        passport.serializeUser(passportConfig.serializeUser);
        passport.deserializeUser(passportConfig.deserializeUser) ;
    }

    app.passportSetting  = passportConfig;
    app.passport  = passport;

};
