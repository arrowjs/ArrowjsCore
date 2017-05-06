'use strict';
const _ = require('lodash');

/**
 *
 * @param permissions
 * @param componentName
 * @param key
 */
module.exports = function handleRole(permissions, componentName, key) {
  let arrayPermissions = [];
  if (_.isArray(permissions)) {
    arrayPermissions = permissions
  } else {
    arrayPermissions.push(permissions);
  }
  return function handleRoles(req, res, next) {
    req.permissions = req.session.permissions;
    if (req.permissions && req.permissions[key] && req.permissions[key][componentName]) {
      let checkedPermission = req.permissions[key][componentName].filter(function (key) {
        if (arrayPermissions.includes(key.name)) {
          return key
        }
      }).map(function (data) {
        return data.name
      });
      if (!_.isEmpty(checkedPermission)) {
        req.permissions = checkedPermission;
        req.hasPermission = true
      }
    } else {
      req.hasPermission = false;
    }
    next();
  }
};