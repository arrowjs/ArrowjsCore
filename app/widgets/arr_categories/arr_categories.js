'use strict';

var BaseWidget = require('../base_widget'),
    util = require('util'),
    _ = require('lodash'),
    Promise = require('bluebird');

Categories.prototype.save = function (data) {

    return BaseWidget.prototype.save.call(this, data);
};

function Categories() {
    let _base_config = {
        alias: "arr_categories",
        name: "Categories",
        description: "Display list of published categories",
        author: "ZaiChi",
        version: "0.1.0",
        options: {
            title: ''
        }
    };
    Categories.super_.call(this);
    _.assign(this, _base_config);
    this.files = BaseWidget.prototype.getAllLayouts.call(this, _base_config.alias);
}

util.inherits(Categories, BaseWidget);

Categories.prototype.render = function (widget) {
    let _this = this;
    return new Promise(function (resolve) {
        __models.category.findAll({
            attributes: ['name', 'slug', 'id', 'count'],
            order: "name ASC"
        }).then(function (categories) {
            let resultsCategories = [];
            categories.forEach(function (parent) {
                if (parent.level > 1) {
                    parent.name = StringUtilities.repeat(' &#8212;', parseInt(parent.level) - 1) + " " + parent.name;
                }
                resultsCategories.push(parent);
            });

            resolve(BaseWidget.prototype.render.call(_this, widget, {items: resultsCategories}));
        });
    })
};

let StringUtilities = {
    repeat: function (str, times) {
        return (new Array(times + 1)).join(str);
    }
};

module.exports = Categories;
