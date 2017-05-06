'use strict';
const _ = require('lodash');
const path = require('path');
const express = require( 'express');

const overrideViewRender = require('./overrideViewRender');
const handleRole = require('./handleRole');
const handleAuthenticate = require('./handleAuthenticate');

module.exports =  function makeHandlerChain(feature, route, routePath, routeInfo, method) {
  const arrow = this;
  const setting = arrow.arrowSettings;
  const featureViews = feature.views;
  const featureConfigName = feature.name;
  const featureType = feature.type;

  if (routeInfo.name) {
    arrow._arrRoutes[routeInfo.name] = path.normalize(prefix + routePath);
  }
  //handle function
  let routeHandler;
  const defaultHandler = function (req, res, next) {
    next(new Error("Invalid controller"));
  };

  routeHandler = routeInfo.handler;

  //TODO: need authenticate
  // let authenticate = routeInfo.authenticate ?
  //   routeInfo.authenticate : false;
  // if (!_.isString(authenticate) || !_.isBoolean(authenticate)) {
  //   return false
  // }

  //Setting base Handler
  let arrayHandler = [];
  if (_.isArray(routeHandler)) {
    arrayHandler = routeHandler.filter(_.isFunction);
  } else if (_.isFunction(routeHandler)) {
    arrayHandler.push(routeHandler)
  } else {
    arrayHandler.push(defaultHandler)
  }

  //Add viewRender
  if (!_.isEmpty(featureViews)) {
    arrayHandler.unshift(overrideViewRender(arrow, feature))
  }

  //handle role
  //TODO: need new RBAC
  if (setting && setting.role) {
    let permissions = routeInfo.permissions;
    if (permissions) {
      arrayHandler.unshift(arrow.passportSetting.handlePermission);
      arrayHandler.unshift(handleRole(permissions, featureConfigName, featureType))
    }
  }

  //add middleware after authenticate;
  if (!_.isEmpty(arrow.afterAuth)) {
    arrow.afterAuth.map(function (func) {
      arrayHandler.unshift(func)
    })
  }

  //handle Authenticate
  if (setting && setting.passport) {
    if (authenticate) {
      arrayHandler.unshift(handleAuthenticate(arrow, authenticate))
    }
  }

  //add middleware before authenticate;
  if (!_.isEmpty(arrow.beforeAuth)) {
    arrow.beforeAuth.map(function (func) {
      arrayHandler.unshift(func)
    })
  }
  //Add to route
  if (method === "param") {
    if (_.isString(routeInfo.key) && !_.isArray(routeInfo.handler)) {
      return route.param(routeInfo.key, routeInfo.handler);
    }
  } else if (method === 'all') {
    route.route(routePath)[method](arrayHandler);
    return true;
  } else if (route[method] && !['route', 'use'].includes(method)) {
    if (routeInfo.order) {
      let newRoute = express.Router();
      newRoute.componentName = componentName;
      newRoute.order = routeInfo.order;
      newRoute.route(routePath)[method](arrayHandler);
      arrow.use(prefix, newRoute);
      return true
    }
    route.route(routePath)[method](arrayHandler);
    return true
  } else {
    return false
  }
};