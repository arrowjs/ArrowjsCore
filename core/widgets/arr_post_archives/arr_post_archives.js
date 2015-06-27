"use strict";

var BaseWidget = require(__base + 'core/widgets/BaseWidget'),
    _ = require('lodash'),
    Promise = require('bluebird');

class PostArchives extends BaseWidget {
    constructor() {
        super();

        let conf = {
            alias: "arr_post_archives",
            name: "Post Archives",
            description: "Display post archives",
            author: "ZaiChi",
            version: "0.1.0",
            options: {
                id: '',
                title: '',
                show_post_count: ''
            }
        };
        conf = _.assign(this.config, conf);

        this.files = this.getAllLayouts(conf.alias);
    }

    render(widget) {
        let base_render = super.render;
        let self = this;

        let sql = "";
        if (widget.data.show_post_count == '1') {
            sql = "SELECT COUNT(id) AS count, CONCAT(TO_CHAR(created_at, 'YYYY-MM'),'-01') AS date, CONCAT(TO_CHAR(created_at, 'YYYY-MM'),'-99') AS dateX FROM arr_post WHERE type='post' GROUP BY date, dateX ORDER BY date DESC";
        } else {
            sql = "SELECT CONCAT(TO_CHAR(created_at, 'YYYY-MM'),'-01') AS date, CONCAT(TO_CHAR(created_at, 'YYYY-MM'),'-99') AS dateX FROM arr_post WHERE type='post' GROUP BY date, dateX ORDER BY date DESC";
        }

        return new Promise(function (resolve, reject) {
            __models.sequelize.query(sql).then(function (archives) {
                resolve(base_render.call(self, widget, {items: archives[0]}));
            });
        });
    }
}

module.exports = PostArchives;

