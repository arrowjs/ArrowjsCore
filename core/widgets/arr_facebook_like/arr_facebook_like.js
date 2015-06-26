'use strict';

var BaseWidget = require(__base + 'core/widgets/BaseWidget'),
    _ = require('lodash');

class FacebookLike  extends BaseWidget {
    constructor(){
        super();
        let conf = {
            alias: "arr_facebook_like",
            name: "Facebook Like",
            description: "Facebook Like (+Share). Require active Facebook SDK plugin first!",
            author: "Robin Huy",
            version: "0.1.0",
            options: {
                layout_type: '',
                action_type: '',
                show_friend_faces: '',
                include_share_button: '',
                color_scheme: ''
            }
        };
        conf = _.assign(this.config, conf);
        this.files = this.getAllLayouts(conf.alias);
    }
}

module.exports = FacebookLike;