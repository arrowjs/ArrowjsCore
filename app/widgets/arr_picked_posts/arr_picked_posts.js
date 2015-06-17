"use strict";

var BaseWidget = require('../base_widget'),
    util = require('util'),
    _ = require('lodash'),
    Promise = require('bluebird');

function PickedPosts() {
    let _base_config = {
        alias: "arr_picked_posts",
        name: "Picked posts",
        description: "Display the picked posts",
        author: "ZaiChi",
        version: "0.1.0",
        options: {
            id: '',
            title: '',
            text_ids: '',
            display_date: '',
            display_index: ''
        }
    };
    PickedPosts.super_.call(this);
    _.assign(this, _base_config);
    this.files = BaseWidget.prototype.getAllLayouts.call(this, _base_config.alias);
}
util.inherits(PickedPosts, BaseWidget);

PickedPosts.prototype.save = function (data, done) {
    //Processing here
    if (data.text_ids.length > 0) {
        let ids = data.text_ids.split(',');
        if (ids.length > 0) {
            for (let i = 0; i < ids.length; i++) {
                ids[i] = parseInt(ids[i]);
            }
        }
        data.text_ids = ids.join(',');
    } else {
        data.text_ids = '';
    }
    return BaseWidget.prototype.save.call(this, data, done);
};

PickedPosts.prototype.render = function (widget) {
    let _this = this;
    return new Promise(function (resolve) {
        let ids = widget.data.text_ids.split(',');
        widget.data.text_ids = widget.data.text_ids.trim();
        if (widget.data.text_ids.length > 0 && ids.length > 0) {
            __models.posts.findAll({
                include: [__models.user],
                order: "hit ASC",
                attributes: ['id', 'title', 'alias', 'image', 'intro_text', 'created_at'],
                where: {
                    id: ids,
                    type: 'post'
                }
            }).then(function (posts) {
                resolve(BaseWidget.prototype.render.call(_this, widget, {items: posts}));
            });
        } else {
            resolve(BaseWidget.prototype.render.call(_this, widget, {items: []}));
        }
    });
};

module.exports = PickedPosts;
