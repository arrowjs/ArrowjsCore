"use strict";

var BaseWidget = require(__base + 'core/widgets/BaseWidget'),
    _ = require('lodash'),
    Promise = require('bluebird');

class RelatedPost extends BaseWidget {

    constructor(){
        super();
            let conf = {
                alias: "arr_related_post",
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
            conf = _.assign(this.config, conf);
            this.files = this.getAllLayouts(conf.alias);
        }


    render(widget){
        let self = this;
        return new Promise(function (resolve) {
            let conditions = "status = 'publish'";

            let limit = 5;
            if(!isNaN(parseInt(widget.data.number_to_show))){
                limit = widget.data.number_to_show;
            }
            console.log("=======");
            __models.post.findAll({
               // order: "publish_date DESC",
                attributes: ['title', 'name', 'id', 'publish_date'],
               // where: conditions,
                limit: limit
            }).then(function (posts) {
                console.log(posts[0]);
                resolve(BaseWidget.prototype.render.call(self, widget, {items: posts}));
            });
        });
    }
}

module.exports = RelatedPost;