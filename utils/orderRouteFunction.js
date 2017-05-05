'use strict';

module.exports = function orderRouteFunction(a, b) {
  if (a.handle.order) {
    if (b.handle.order) {
      if (a.handle.order > b.handle.order) {
        return 1
      } else if (a.handle.order < b.handle.order) {
        return -1
      } else {
        return 0
      }
    } else {
      return 0
    }
  } else {
    if (b.handle.order) {
      return 1
    } else {
      return 0
    }
  }
};