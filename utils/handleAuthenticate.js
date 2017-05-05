'use strict';
const _ = require('lodash');

module.exports = function handleAuthenticate(application, name) {
  let passport = application.passport;
  if (_.isString(name)) {
    if (application.passportSetting[name]) {
      let strategy = application.passportSetting[name].strategy || name;
      let callback = application.passportSetting[name].callback;
      let option = application.passportSetting[name].option || {};
      if (callback) return passport.authenticate(strategy, option, callback);
      return passport.authenticate(strategy, option);
    }
  } else if (_.isBoolean(name)) {
    if (application.passportSetting.checkAuthenticate && _.isFunction(application.passportSetting.checkAuthenticate)) {
      return application.passportSetting.checkAuthenticate
    }
  }
  return function (req, res, next) {
    next()
  }
};