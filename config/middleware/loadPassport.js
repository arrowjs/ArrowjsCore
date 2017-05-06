'use strict';
let passport = require("passport");
let http = require("http");
let __ = require('../../libs/global_function');
let path = require('path');

/**
 * Use middleware passport
 * @param setting: user setting defined in server.js in root folder of Arrowjs application
 */
module.exports = function loadPassport(setting) {
  let app = this;

  //Monkey patch
  let passportLogout = function () {
    let property = 'user';
    if (this._passport && this._passport.instance) {
      property = this._passport.instance._userProperty || 'user';
    }

    this[property] = null;
    if (this._passport && this._passport.session) {
      if (this.session && this.session.permissions) {
        delete this.session.permissions
      }
      delete this._passport.session.user;
    }
  };

  //If passport is enabled then load its
  if (setting && setting.passport) {
    let passportConfig = require(__base + 'config/passport.js')(passport, app);

    app.use(passport.initialize());
    app.use(passport.session());

    //Read and load all configuration js files in config/strategies
    __.getGlobbedFiles(app.arrFolder + 'config/strategies/**/*.js').forEach(function (strategy) {
      require(path.resolve(strategy))(passport, app.getConfig(), app);
    });
    passport.serializeUser(passportConfig.serializeUser);
    passport.deserializeUser(passportConfig.deserializeUser);

    http.IncomingMessage.prototype.logout = http.IncomingMessage.prototype.logOut = passportLogout;
    app.passportSetting = passportConfig;
    app.passport = passport;
  }
};
