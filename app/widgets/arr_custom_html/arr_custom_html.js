'use strict';
//readFile
let BaseWidget = require(__base + 'core/widgets/BaseWidget'),
    _ = require('lodash');

class CustomHtml extends BaseWidget {
    constructor() {
        super();

        let conf = {
            alias: "arr_custom_html",
            name: "Custom HTML TEST IMPORT",
            description: "Create block HTML to view XXX",
            author: "Nguyen Van Thanh",
            version: "0.1.0",
            options: {
                title: '',
                content: ''
            }
        };
        conf = _.assign(this.config, conf);

        this.files = this.getAllLayouts(conf.alias);
    }
}

module.exports = CustomHtml;
