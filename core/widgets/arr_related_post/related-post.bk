"use strict";

var BaseWidget = require(__base + 'core/widgets/base_widget'),
    util = require('util'),
    _ = require('lodash'),
    Promise = require('bluebird');

var _base_config = {
    alias: "related-post",
    name: "Related post",
    description: "Related post",
    author: "vhchung",
    version: "0.1.0",
    options: {
        id: '',
        title: '',
        text_ids: '',
        number_to_show: ''
    }
};

function RecentPost() {
    RecentPost.super_.call(this);
    _.assign(this, _base_config);
    this.files = BaseWidget.prototype.getAllLayouts.call(this, _base_config.alias);
}
util.inherits(RecentPost, BaseWidget);

RecentPost.prototype.save = function (data, done) {
    return BaseWidget.prototype.save.call(this, data, done);
};

RecentPost.prototype.render = function (widget) {
    let _this = this;
    return new Promise(function (resolve) {
        let conditions = "status = 'publish'";

        let limit = 5;
        if(!isNaN(parseInt(widget.data.number_to_show))){
            limit = widget.data.number_to_show;
        }

        __models.post.findAll({
            order: "publish_date DESC",
            attributes: ['title', 'name', 'id', 'publish_date'],
            where: conditions,
            limit: limit
        }).then(function (posts) {
            resolve(BaseWidget.prototype.render.call(_this, widget, {items: posts}));
        });
    });
};

module.exports = RecentPost;
