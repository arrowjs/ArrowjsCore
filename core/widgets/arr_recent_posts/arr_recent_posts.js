"use strict";


var BaseWidget = require(__base + 'core/widgets/BaseWidget'),
    _ = require('lodash'),
    Promise = require('bluebird');

class RecentPosts extends BaseWidget {
    constructor(){
        super();
        let conf = {
            alias: "arr_recent_posts",
            name: "Recent posts",
            description: "Display list of recent posts",
            author: "Robin",
            version: "0.1.0",
            options: {
                id: '',
                title: '',
                text_ids: '',
                number_to_show: ''
            }
        };
        conf = _.assign(this.config, conf);
        this.files = this.getAllLayouts(conf.alias);
    }

    save(data, done){
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
    }

    render(widget){
        let self = this;
        return new Promise(function (resolve) {
            let conditions = "type = 'post'";

            if (widget.data.text_ids != '') {
                let ids = widget.data.text_ids.split(',');
                let new_ids = ids.map(function (item, i) {
                    return 'categories LIKE \'%:' + item + ':%\'';
                });
                conditions = "(" + new_ids.join(' OR ') + ") AND type = 'post'";
            }

            let limit = 5;
            if(!isNaN(parseInt(widget.data.number_to_show))){
                limit = widget.data.number_to_show;
            }
            __models.post.findAll({
                order: "published_at DESC",
                attributes: ['title', 'alias', 'id', 'published_at'],
                where: [conditions],
                limit: limit
            }).then(function (posts) {
                resolve(BaseWidget.prototype.render.call(self, widget, {items: posts}));
            });
        });
    }
}

module.exports = RecentPosts;