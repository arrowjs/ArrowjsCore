/**
 * Created by trquoccuong on 5/5/2017.
 */
'use strict';
const logger = require('./handleLogger');
const express = require('express');
const handleComponentRouteSetting = require('./handleComponentRouteSetting');

/**
 * load feature's routes and render
 * @param {ArrowApplication } arrow
 * @param {object} userSetting
 */

module.exports = function setupRoute(arrow) {
  const userSetting = arrow.arrowSettings;

  arrow._componentList.map(function (key) {
    Object.keys(arrow[key]).map(function (componentKey) {
      /** display loaded feature in console log when booting Arrowjs application */
      logger.info("Arrow loaded: '" + key + "' - '" + componentKey + "'");
      let routeConfig = arrow[key][componentKey]._structure.route;
      if (routeConfig) {
        Object.keys(routeConfig.path).map(function (second_key) {
          let defaultRouteConfig = routeConfig.path[second_key];
          if (arrow[key][componentKey].routes[second_key]) {
            let componentRouteSetting = arrow[key][componentKey].routes[second_key];
            handleComponentRouteSetting(arrow, componentRouteSetting, defaultRouteConfig, key, userSetting, componentKey);
          } else {
            let componentRouteSetting = arrow[key][componentKey].routes;
            //Handle Route Path;
            handleComponentRouteSetting(arrow, componentRouteSetting, defaultRouteConfig, key, userSetting, componentKey);
          }
        });
      }
    })
  });
  return arrow;
};
