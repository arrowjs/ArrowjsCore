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
            description: "Display list of published categories",
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

                resolve(base_render.call(self, widget, {items: resultsCategories}));
            });
        })
    }
}

let StringUtilities = {
    repeat: function (str, times) {
        return (new Array(times + 1)).join(str);
    }
};

module.exports = Categories;
