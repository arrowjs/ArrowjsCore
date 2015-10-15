'use strict'

var Arrow = require('./libs/arrowjs');
module.exports = Arrow;
module.exports.configManager = require('./libs/config_manager');
module.exports.acl = require('./libs/acl');
module.exports.dateformatter = require('./libs/dateformatter');
module.exports.eventManager = require('./libs/event_manager');
module.exports.menuManager = require('./libs/menus_manager');
module.exports.model = require('./libs/models_manager');
module.exports.moduleManager = require('./libs/modules_manager');
module.exports.pluginManager = require('./libs/plugins_manager');
module.exports.widgetManager = require('./libs/widgets_manager');