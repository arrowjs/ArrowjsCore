"use strict";

const __ =  require('./global_function'),
     i18n =  require('i18n'),
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
module.exports.setupMultiLanguage = function (config) {
  config.language.directory = __base + config.language.directory
  i18n.configure(config.language);
};