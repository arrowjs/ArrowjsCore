'use strict';

module.exports = function overrideExpress(app) {
  app.use(function overrideRender(req, res, next) {
    req.app = app;
    next()
  });
  app.use(function overrideRedirect(req, res, next) {
    next()
  })
};