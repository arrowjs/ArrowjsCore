'use strict';
const mongoAction = require('../action/mongo_action')
const modelToTemplate= require('../../libs/modelToTemplate')
const _ = require('lodash');
const pluralize = require('pluralize');

module.exports = function (feature, modelName) {
  const template = modelToTemplate('mongodb', feature.models[modelName])
  const name =  feature.name
  mongoAction(feature.actions, feature.models[modelName], template);
  const controllers = feature.controllers;
  const actions = feature.actions;
  const tableTemplate = _.pickBy(template, function(value) {
    return value.arrTable
  })
  controllers.showAll = function (req, res, next) {
    actions.find()
      .then(function (listItems) {
        res.render('list',{
          items: listItems,
          arrTemplate: tableTemplate,
          name
        })
      })
  };

  controllers.create = function (req, res, next) {
    actions.create(req.body)
      .then(function () {
        req.flash.success(`${_.capitalize(name)} was successfully created.`)
        res.redirect('/books')
      })
  };

  controllers.detail = function (req, res, next) {
    actions.findById(req.params.id)
      .then(function (detail) {
        res.render('detail',{
          detail,
          name
        })
      })
  };

  controllers.createPage = function (req, res, next) {
    res.render('new', {
      arrTemplate : template,
      name
    })
  };

  controllers.edit = function (req, res, next) {
    actions.update(req.params.id, req.body)
      .then(function () {
        req.flash.success(`${_.capitalize(name)} was successfully updated.`)
        res.redirect('/books')
      })
  };

  controllers.editPage = function (req, res, next) {
    actions.findById(req.params.id)
      .then(function (detail) {
        res.render('edit',{
          detail,
          arrTemplate : template,
          name
        })
      })
  };

  controllers.destroy = function (req, res, next) {
    actions.destroy(req.params.id)
      .then(function () {
        req.flash.success(`${_.capitalize(name)} was successfully deleted.`)
        res.redirect('/books')
      })
  };
};