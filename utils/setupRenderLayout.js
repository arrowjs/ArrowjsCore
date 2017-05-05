'use strict';
const path = require('path');
const ViewEngine = require("../libs/ViewEngine");
const _ = require('lodash');

module.exports = function (self) {
  let viewEngineSetting = _.assign(self._config.nunjuckSettings || {}, {express: self._expressApplication});
  let applicationView = ViewEngine(self.arrFolder, viewEngineSetting, self);
  self.applicationENV = applicationView;
  const viewTemplateFolder = path.resolve(__dirname, '..', 'generator/view');

  self.render = function (view, options, callback) {
    let application = self;
    let done = callback;

    let opts = options || {};
    /* istanbul ignore else */
    if (typeof options === "function") {
      done = options;
      opts = {};
    }

    _.assign(opts, application.locals);

    if (application._config.viewExtension && view.indexOf(application._config.viewExtension) === -1 && view.indexOf(".") === -1) {
      view += "." + application._config.viewExtension;
    }

    let arrayPart = view.split(path.sep);
    arrayPart = arrayPart.map(function (key) {
      if (key[0] === ":") {
        key = key.replace(":", "");
        return application.getConfig(key);
      } else {
        return key
      }
    });

    let newLink = arrayPart.join(path.sep);
    newLink = path.normalize(newLink);
    application.applicationENV.loaders[0].pathsToNames = {};
    // application.applicationENV.loaders[0].cache= {};
    let searchPaths = [];
    searchPaths.push(application.arrFolder + 'layouts');
    searchPaths.push(viewTemplateFolder);
    application.applicationENV.loaders[0].searchPaths = searchPaths;
    return application.applicationENV.render(newLink, opts, done);
  }.bind(self);

  self.renderString = applicationView.renderString.bind(applicationView);
};