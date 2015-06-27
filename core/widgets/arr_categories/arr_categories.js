'use strict';

var BaseWidget = require(__base + 'core/widgets/BaseWidget'),
    _ = require('lodash'),
    Promise = require('bluebird');

class Categories extends BaseWidget {
    constructor() {
        super();

        let conf = {
            alias: "arr_categories",
            name: "Categories",
            description: "Display list of categories",
            author: "ZaiChi",
            version: "0.1.0",
            options: {
                title: ''
            }
        };

        conf = _.assign(this.config, conf);

        this.files = this.getAllLayouts(conf.alias);
    }

    render(widget) {
        let base_render = super.render;
        let self = this;

        return new Promise(function (resolve) {
            __models.category.findAll({
                order: "name ASC"
            }).then(function (categories) {
                resolve(base_render.call(self, widget, {
                    items: categories
                }));
            });
        })
    }
}

module.exports = Categories;
