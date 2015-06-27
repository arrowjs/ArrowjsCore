"use strict";

var BaseWidget = require(__base + 'core/widgets/BaseWidget'),
    _ = require('lodash'),
    Promise = require('bluebird');

class PickedPosts extends BaseWidget {
    constructor() {
        super();

        let conf = {
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
        conf = _.assign(this.config, conf);

        this.files = this.getAllLayouts(conf.alias);
    }

    save(data, done) {
        let base_save = super.save;

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

        return base_save.call(this, data, done);
    }

    render(widget) {
        let base_render = super.render;
        let self = this;

        return new Promise(function (resolve) {
            let ids = widget.data.text_ids.split(',');
            widget.data.text_ids = widget.data.text_ids.trim();

            if (widget.data.text_ids.length > 0 && ids.length > 0) {
                __models.post.findAll({
                    include: [__models.user],
                    order: "published_at DESC",
                    attributes: ['id', 'title', 'alias', 'image', 'intro_text', 'created_at'],
                    where: {
                        id: ids,
                        type: 'post'
                    }
                }).then(function (posts) {
                    resolve(base_render.call(self, widget, {
                        items: posts
                    }));
                });
            } else {
                resolve(base_render.call(self, widget, {
                    items: []
                }));
            }
        });
    }
}

module.exports = PickedPosts;