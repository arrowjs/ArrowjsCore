'use strict';

var BaseWidget = require('../base_widget'),
    util = require('util'),
    config = require(__base + 'config/config'),
    _ = require('lodash');

function FacebookLike() {
    let _base_config = {
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

    FacebookLike.super_.call(this);
    _.assign(this, _base_config);
    this.files = BaseWidget.prototype.getAllLayouts.call(this, _base_config.alias);
}
util.inherits(FacebookLike, BaseWidget);

module.exports = FacebookLike;
