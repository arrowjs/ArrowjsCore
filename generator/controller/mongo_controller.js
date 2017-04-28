'use strict';

module.exports = function (controller,model) {
  controller.showAll = function (req, res, next) {
    res.render('index')
  };
  controller.create = function (req, res, next) {
    res.send('create')
  };
  controller.detail = function (req, res, next) {
    res.render('detail')
  };
  controller.createPage = function (req, res, next) {
    res.render('new')
  };
  controller.edit = function (req, res, next) {
    res.redirect('demo')
  };
  controller.editPage = function (req, res, next) {
    res.render('edit')
  };
};