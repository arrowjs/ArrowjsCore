'use strict';

var BaseWidget = require(__base + 'core/widgets/base_widget'),
    util = require('util'),
    _ = require('lodash');

function CustomHtml() {
    let _base_config = {
        alias: "arr_custom_html",
        name: "Custom HTML",
        description: "Create block HTML to view",
        author: "Nguyen Van Thanh",
        version: "0.1.0",
        options: {
            title: '',
            content: ''
        }
    };
    CustomHtml.super_.call(this);
    _.assign(this, _base_config);
    this.files = BaseWidget.prototype.getAllLayouts.call(this, _base_config.alias);
}
util.inherits(CustomHtml, BaseWidget);

module.exports = CustomHtml;
