'use strict';

var BaseWidget = require(__base + 'core/widgets/base_widget'),
    util = require('util'),
    _ = require('lodash');

function FacebookComments() {
    let _base_config = {
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

    FacebookComments.super_.call(this);
    _.assign(this, _base_config);
    this.files = BaseWidget.prototype.getAllLayouts.call(this, _base_config.alias);
}
util.inherits(FacebookComments, BaseWidget);

module.exports = FacebookComments;
