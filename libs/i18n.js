"use strict";

let __ =  require('./global_function');

let lang = {};
let path = require('path');

module.exports = lang;

module.exports.loadLanguage = function (config) {
    let languagePath = __base + config.langPath + '/*.js';
    __.getGlobbedFiles(languagePath).forEach(function (file) {
        lang[path.basename(file, '.js')] = require(file);
    })
};