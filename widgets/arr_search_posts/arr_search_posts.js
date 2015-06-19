"use strict";

var BaseWidget = require('../base_widget'),
    util = require('util'),
    _ = require('lodash'),
    Promise = require('bluebird');

function SearchPosts() {
    let _base_config = {
        alias: "arr_search_posts",
        name: "Search posts",
        description: "Display search box to search posts by keyword",
        author: "Robin",
        version: "0.1.0",
        options: {
            id: '',
            title: '',
            placeholder: '',
            button_name: ''
        }
    };
    SearchPosts.super_.call(this);
    _.assign(this, _base_config);
    this.files = BaseWidget.prototype.getAllLayouts.call(this, _base_config.alias);
}
util.inherits(SearchPosts, BaseWidget);

SearchPosts.prototype.save = function (data, done) {
    if (data.button_name.length == 0) {
        data.button_name = 'Search';
    }
    return BaseWidget.prototype.save.call(this, data, done);
};

module.exports = SearchPosts;
