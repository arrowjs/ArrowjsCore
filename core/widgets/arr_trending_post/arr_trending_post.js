"use strict";

var BaseWidget = require(__base + 'core/widgets/base_widget'),
    util = require('util'),
    _ = require('lodash'),
    GA = require(__base + 'core/libs/ga'),
    ga = new GA(),
    Promise = require('bluebird');

var _base_config = {
    alias: "arr_trending_post",
    name: "Trending post",
    description: "Trending post",
    author: "Jack",
    version: "0.1.0",
    options: {
        id: '',
        title: '',
        mark_link: ''

    }
};

function TrendingPost() {
    TrendingPost.super_.call(this);
    _.assign(this, _base_config);
    this.files = BaseWidget.prototype.getAllLayouts.call(this, _base_config.alias);
}
util.inherits(TrendingPost, BaseWidget);

TrendingPost.prototype.save = function (data, done) {
    //Processing here
    /*if (data.text_ids.length > 0) {
     let ids = data.text_ids.split(',');
     if (ids.length > 0) {
     for (let i = 0; i < ids.length; i++) {
     ids[i] = parseInt(ids[i]);
     }
     }
     data.text_ids = ids.join(',');
     } else {
     data.text_ids = '';
     }*/
    return BaseWidget.prototype.save.call(this, data, done);
};

TrendingPost.prototype.render = function (widget) {
    let _this = this;
    return new Promise(function (resolve) {
        ga.getGooglePopularLinkInformation(widget.data.mark_link, function (data) {
            if (data == null) {
                resolve(BaseWidget.prototype.render.call(_this, widget));
                return;
            }
            var ids = [];
            for (var i in data.rows) {
                let regex = /\/([0-9]+)\//gi;
                let match = regex.exec(data.rows[i][0]);
                ids.push(match[1]);
            }
            //console.log(ids);
            __models.posts.findAll({
                attributes: ['title', 'alias', 'id', 'published_at','image'],
                where: {
                    id: {
                        'in': ids
                    }
                }
            }, {raw: true}).then(function (posts) {
                    var sortPosts = [];
                    for (let y in ids) {
                        for (let i in posts) {
                            //console.log(ids[y], posts[i].id);
                            if (ids[y] == posts[i].id) {
                                sortPosts.push(posts[i]);
                                //console.log(posts[i].id, posts[i].alias);
                                posts.splice(i, 1);
                                break;
                            }
                        }
                    }
                    resolve(BaseWidget.prototype.render.call(_this, widget, {items: sortPosts}));
                }
            );
        });
    });
};

module.exports = TrendingPost;
