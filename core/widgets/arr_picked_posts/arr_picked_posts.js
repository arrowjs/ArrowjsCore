"use strict";

/**
 * Chưa ổn
 */

var BaseWidget = require(__base + 'core/widgets/BaseWidget'),
    _ = require('lodash'),
    Promise = require('bluebird');

class PickedPosts extends BaseWidget {
    constructor(){
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
        //Processing here
        console.log("+++++++++++++++");
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
        console.log("----------",data);
        return BaseWidget.prototype.save.call(this, data, done);
    }

    render(widget){
        let self = this;
        return new Promise(function (resolve) {
            let ids = widget.data.text_ids.split(',');
            widget.data.text_ids = widget.data.text_ids.trim();
            console.log("length", widget.data.text_ids.length);
            if (widget.data.text_ids.length > 0 && ids.length > 0) {
                console.log("**********");

                __models.post.findAll({
                    include: [__models.user],
                    order: "hit ASC",
                    attributes: ['id', 'title', 'alias', 'image', 'intro_text', 'created_at'],
                    where: {
                        id: ids,
                        type: 'post'
                    }
                }).then(function (posts) {
                    console.log("=======",posts[0]);
                    resolve(BaseWidget.prototype.render.call(self, widget, {items: posts}));
                });
            } else {
                resolve(BaseWidget.prototype.render.call(self, widget, {items: []}));
            }
        });
    }
}

module.exports = PickedPosts;