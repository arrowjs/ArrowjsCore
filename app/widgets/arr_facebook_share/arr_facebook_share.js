'use strict';

var BaseWidget = require('../base_widget'),
    util = require('util'),
    config = require(__base + 'config/config'),
    _ = require('lodash');

function FacebookShare() {
    let _base_config = {
        alias: "arr_facebook_share",
        name: "Facebook Share",
        description: "Facebook Share. Require active Facebook SDK plugin first!",
        author: "Robin Huy",
        version: "0.1.0",
        options: {
            layout_type: ''
        }
    };

    FacebookShare.super_.call(this);
    _.assign(this, _base_config);
    this.files = BaseWidget.prototype.getAllLayouts.call(this, _base_config.alias);
}
util.inherits(FacebookShare, BaseWidget);

module.exports = FacebookShare;
