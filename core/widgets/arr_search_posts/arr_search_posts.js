"use strict";

var BaseWidget = require(__base + 'core/widgets/BaseWidget'),
    _ = require('lodash'),
    Promise = require('bluebird');

class SearchPosts extends BaseWidget {
    constructor(){
        super();
        let conf = {
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
        conf =  _.assign(this.config, conf);
        this.files = this.getAllLayouts(conf.alias);
    }

    save(data, done){
        if (data.button_name.length == 0) {
            data.button_name = 'Search';
        }
        return BaseWidget.prototype.save.call(this, data, done);
    }
}

module.exports = SearchPosts;