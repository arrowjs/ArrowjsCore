'use strict';

module.exports = function overrideExpress(app) {
  app.use(function overrideRedirect(req, res, next) {
    next()
  })
};