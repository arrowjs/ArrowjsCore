'use strict';


var BaseWidget = require(__base + 'core/widgets/BaseWidget'),
    _ = require('lodash');

class FacebookComments extends BaseWidget{
    constructor(){
        super();
        let conf = {
            alias: "arr_facebook_comments",
            name: "Facebook Comments",
            description: "Facebook Comments. Require active Facebook SDK plugin first!",
            author: "Robin Huy",
            version: "0.1.0",
            options: {
                number_of_posts: '5',
                color_scheme: '',
                order_by: ''
            }
        };
        conf = _.assign(this.config, conf);

        this.files = this.getAllLayouts(conf.alias);
    }

}

module.exports = FacebookComments;