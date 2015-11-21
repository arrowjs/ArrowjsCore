'use strict';

var Arrow = require('./libs/ArrowApplication');
module.exports = Arrow;
module.exports.globalFunction = require('./libs/global_function');
module.exports.logger = require('./libs/logger');

//Export node_module from Core node_module  to App node_module
module.exports.Promise = require('bluebird');
module.exports._ = require('lodash');
module.exports.glob = require('glob');
module.exports.cookieParse = require('cookie-parser');
module.exports.language = require('./libs/i18n');
module.exports.bodyParser = require('body-parser');
module.exports.methodOverride = require('method-override');
module.exports.fs = require('fs-extra');
module.exports.sercurity = require('helmet');
module.exports.winston = require('winston');

