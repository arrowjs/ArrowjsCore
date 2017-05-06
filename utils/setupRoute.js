/**
 * Created by trquoccuong on 5/5/2017.
 */
'use strict';
const logger = require('./handleLogger');
const makeRoute = require('./makeRoute');

/**
 * load feature's routes and render
 * @param {ArrowApplication } arrow
 * @param {object} userSetting
 */

module.exports = function setupRoute(arrow) {
  arrow._componentList.map(function (key) {
    Object.keys(arrow[key]).map(function (componentKey) {
      /** display loaded feature in console log when booting Arrowjs application */
      logger.info("Arrow loaded: '" + key + "' - '" + componentKey + "'");
      let routeConfig = arrow[key][componentKey]._structure.route;
      if (routeConfig) {
        Object.keys(routeConfig.path).map(function (second_key) {
          if (arrow[key][componentKey].routes[second_key]) {
            makeRoute.call(arrow, key, componentKey, second_key);
          } else {
            //Handle Route Path;
            makeRoute.call(arrow, key, componentKey, second_key);
          }
        });
      }
    })
  });
  return arrow;
};
