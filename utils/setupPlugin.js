'use strict';

module.exports = function setupPlugin(self) {
  let resolve = Promise.resolve();
  self.plugins.map(function (plug) {
    resolve = resolve.then(function () {
      return plug()
    })
  });
  return resolve
};