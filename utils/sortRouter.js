'use strict';
const orderRouteFunction = require('./orderRouteFunction');

module.exports = function sortRouter(self,stackBegin) {
  const setting = self.arrowSettings;
  if (setting && setting.order) {
    let coreRoute = self._router.stack.slice(0, stackBegin);
    let newRoute = self._router.stack.slice(stackBegin);
    newRoute = newRoute.sort(orderRouteFunction);
    coreRoute = coreRoute.concat(newRoute);
    self._router.stack = coreRoute
  }
}