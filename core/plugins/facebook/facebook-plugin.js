'use strict';

var Promise = require('bluebird'),
    _ = require('lodash');

function FacebookPlugin() {
    let _base_config = {
        alias: 'facebook',
        name: 'Facebook SDK',
        author: 'Jack',
        version: '0.1.0',
        description: 'Facebook SDK for JavaScript v2.3',
        active: true,
        sync: false,
        options: {
            appId: '347148475491688',
            language: 'en_US'
        }
    };

    let self = this;
    _.assign(self, _base_config);

    this.after_open_body_tag = function (data) {
        return new Promise(function (done, reject) {
            let html = '<div id="fb-root"></div>' +
                '<script>' +
                'window.fbAsyncInit = function () {' +
                'FB.init({' +
                'appId: "' + self.options.appId + '",' +
                'xfbml: true,' +
                'version: "v2.3"' +
                '});' +
                '};' +
                '(function (d, s, id) {' +
                'var js, fjs = d.getElementsByTagName(s)[0];' +
                'if (d.getElementById(id)) {' +
                'return;' +
                '}' +
                'js = d.createElement(s);' +
                'js.id = id;' +
                'js.src = "//connect.facebook.net/' + self.options.language + '/sdk.js";' +
                'fjs.parentNode.insertBefore(js, fjs);' +
                '}(document, \'script\', \'facebook-jssdk\'));' +
                '</script>';
            done(html);
        });
    };

    this.before_close_body_tag = function (data) {
        return new Promise(function (done, reject) {
            let html = '<script>' +
                'var currentUrl = location.protocol + \'//\' + location.host + location.pathname;' +
                'var fbElements = document.getElementsByClassName(\'fb-comments\');' +
                'for(var fbi = 0; fbi < fbElements.length; fbi++)' +
                '{ fbElements[fbi].setAttribute(\'data-href\', currentUrl); }' +
                '</script>';
            done(html);
        });
    };
}

module.exports = new FacebookPlugin();

