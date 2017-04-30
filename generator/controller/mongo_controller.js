'use strict';
const mongoAction = require('../action/mongo_action')
const modelToTemplate= require('../../libs/modelToTemplate')
module.exports = function (feature, model) {
  mongoAction(feature.actions, model);
  const controllers = feature.controllers;
  const actions = feature.actions
  controllers.showAll = function (req, res, next) {
    res.render('list')
  };
  controllers.create = function (req, res, next) {
    res.send('create')
  };
  controllers.detail = function (req, res, next) {
    res.render('detail')
  };
  controllers.createPage = function (req, res, next) {
    res.render('new', { arrTemplate : modelToTemplate('mongodb', model) })
  };
  controllers.edit = function (req, res, next) {
    res.redirect('demo')
  };
  controllers.editPage = function (req, res, next) {
    res.render('edit')
  };
};