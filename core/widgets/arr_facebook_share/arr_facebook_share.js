'use strict';

var BaseWidget = require(__base + 'core/widgets/BaseWidget'),
    _ = require('lodash');

class FacebookShare extends BaseWidget {
    constructor(){
        super();
        let conf = {
            alias: "arr_facebook_share",
            name: "Facebook Share",
            description: "Facebook Share. Require active Facebook SDK plugin first!",
            author: "Robin Huy",
            version: "0.1.0",
            options: {
                layout_type: ''
            }
        };
        conf = _.assign(this.config, conf);
        this.files = this.getAllLayouts(conf.alias);
    }
}

module.exports = FacebookShare;