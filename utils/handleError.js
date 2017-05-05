'use strict';

/**
 * Handle Error and redirect error
 * @param app
 */
module.exports = function handleError(app) {
  /** Assume 'not found' in the error msg is a 404.
   * This is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
   */
  app.use(app._config.handlerError);
  app.use("*", app._config.handler404);
  return app
};