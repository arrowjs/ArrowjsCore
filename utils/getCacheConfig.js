'use strict';

module.exports = function getCacheConfig(self) {
  if (self.getConfig("redis.type") !== "fakeredis") {
    let resolve = self.configManager.getCache();
    self._componentList.map(function (key) {
      let managerName = key + "Manager";
      resolve = resolve.then(function () {
        return self[managerName].getCache()
      })
    });
    return resolve
  } else {
    return Promise.resolve();
  }
};