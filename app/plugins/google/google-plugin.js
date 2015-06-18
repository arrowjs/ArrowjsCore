'use strict';

var Promise = require('bluebird'),
    _ = require('lodash');
var _base_config = {
    alias: 'google',
    name: 'Google analytics',
    author: 'Jack',
    version: '0.1.0',
    description: 'Integrate google analytic in webiste',
    active: true,
    sync: false,
    options: {
        tracking_id: '347148475491688'
    }
};

function GooglePlugin() {
    let self = this;
    _.assign(self, _base_config);

    this.before_close_head_tag = function (data) {
        return new Promise(function (done, reject) {
            let html = '<script>' +
                '(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){' +
                '(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),' +
                'm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)' +
                '})(window,document,"script","//www.google-analytics.com/analytics.js","ga");' +
                'ga("create", "' + self.options.tracking_id + '", "auto");' +
                'ga("send", "pageview");' +
                '</script>';
            done(html);
        });
    }
}

module.exports = new GooglePlugin();

