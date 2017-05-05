"use strict";
let util = require('util');
/**
 * Auto template function ;
 * @type {{__: Function}}
 */
const mongoController = require('../generator/controller/mongo_controller')
const apiMongoController = require('../generator/controller/api_mongo_controller')
const apiSQLController = require('../generator/controller/api_sql_controller')
const sqlController = require('../generator/controller/mongo_controller')

function apiTemplate(model) {
  return {
    "/": {
      get: {
        handler: function (req, res) {
          res.send('show all')
        }
      },
      post: {
        handler: function (req, res) {
          res.send('create all')

        }
      },
      "/:id": {
        get: {
          handler: function (req, res) {
            res.send('show one')
          }
        },
        put: {
          handler: function (req, res) {
            res.send('update one')
          }
        },
        patch: {
          handler: function (req, res) {
            res.send('update one')
          }
        }
      },
    }
  }
}

function layoutTemplate(model, feature) {
  mongoController(feature, model)
  const controller = feature.controllers
  return {
    "/": {
      get: {
        handler: controller.showAll
      },
      post: {
        handler: controller.create
      }
    },
    "/new": {
      get: {
        handler: controller.createPage
      },
    },
    "/:id": {
      get: {
        handler: controller.detail
      },
      put: {
        handler: controller.edit
      },
      patch: {
        handler: controller.edit
      },
      delete: {
        handler: controller.destroy
      }
    },
    "/:id/edit": {
      get: {
        handler: controller.editPage
      },
    }
  }
}

module.exports = {
  "template": function (type, model, feature) {
    if (type === 'api') {
      return apiTemplate(feature.models[model], feature)
    } else {
      return layoutTemplate(feature.models[model], feature)
    }
  }
};
