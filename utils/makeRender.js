/**
 * Created by trquoccuong on 5/5/2017.
 */
'use strict';
const path = require('path');
const handleView = require('./handleView');
const _ = require('lodash');
/**
 *
 * @param req
 * @param res
 * @param application
 * @param componentView
 * @param componentName
 * @param component
 * @returns {Function}
 */
module.exports = function makeRender(req, res, application, componentView, componentName, component) {
  const viewTemplateFolder = path.resolve(__dirname, '..', 'generator/view');
  return function (view, options, callback) {
    let done = callback;
    let opts = {};

    //remove flash message
    delete req.session.flash;

    // merge res.locals
    _.assign(opts, application.locals);
    _.assign(opts, res.locals);

    // support callback function as second arg
    /* istanbul ignore if */
    if (typeof options === 'function') {
      done = options;
    } else {
      _.assign(opts, options);
    }
    // default callback to respond
    done = done || function (err, str) {
        if (err) return req.next(err);
        res.send(str);
      };

    if (application._config.viewExtension && !view.includes(application._config.viewExtension) && !view.includes(".")) {
      view += "." + application._config.viewExtension;
    }
    component.viewEngine.loaders[0].pathsToNames = {};
    // component.viewEngine.loaders[0].cache = {};
    const searchPaths = componentView.map(function (obj) {
      return handleView(obj, application, componentName);
    });
    searchPaths.push(viewTemplateFolder);

    component.viewEngine.loaders[0].searchPaths = searchPaths;
    component.viewEngine.render(view, opts, done);
  };
};