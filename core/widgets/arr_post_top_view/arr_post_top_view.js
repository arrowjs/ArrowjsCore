"use strict";

var BaseWidget = require(__base + 'core/widgets/BaseWidget'),
    _ = require('lodash'),
    Promise = require('bluebird');

class PostTopView extends BaseWidget {
    constructor() {
        super();

        let conf = {
            alias: "arr_post_top_view",
            name: "Blog Top View",
            description: "Top view in post",
            author: "ZaiChi",
            version: "0.1.0",
            options: {
                id: '',
                title: '',
                number_to_show: '',
                display_date: '',
                display_index: ''
            }
        };
        conf = _.assign(this.config, conf);

        this.files = this.getAllLayouts(conf.alias);
    }

    render(widget) {
        let base_render = super.render;
        let self = this;

        return new Promise(function (resolve, reject) {
            __models.post.findAll({
                where: ["type = 'post'"],
                include: [__models.user],
                order: "hit DESC",
                limit: parseInt(widget.data.number_to_show)
            }).then(function (posts) {
                resolve(base_render.call(self, widget, {items: posts}));
            });
        });
    }
}

module.exports = PostTopView;