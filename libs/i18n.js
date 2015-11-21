"use strict";

const __ =  require('./global_function'),
     path = require('path');

let lang = {};

module.exports = lang;
module.exports.languageKey = function () {
    let languageKey = Object.keys(lang).filter(function (key) {
        if(key !== 'loadLanguage' && key !== 'languageKey') {
            return key
        }
    });
    return languageKey
}

/**
 * Loading language file.
 * @param config
 */
module.exports.loadLanguage = function (config) {
    let languagePath = __base + config.langPath + '/*.js';
    __.getGlobbedFiles(languagePath).forEach(function (file) {
        lang[path.basename(file, '.js')] = require(file);
    })
};