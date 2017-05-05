'use strict';

module.exports = function getRawPermissions(self) {
  self.permissions = {};
  self._componentList.map(function (key) {
    let managerName = key + "Manager";
    self.permissions[key] = self[managerName].getPermissions();
  });
  return self
};