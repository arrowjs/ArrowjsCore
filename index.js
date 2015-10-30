'use strict'

var Arrow = require('./libs/ArrowApplication');
module.exports = Arrow;
//module.exports.configManager = require('./libs/config_manager');
module.exports.acl = require('./libs/acl');
module.exports.dateformatter = require('./libs/dateformatter');
module.exports.globalFunction = require('./libs/global_function');
module.exports.eventManager = require('./deprecated/event_manager');
module.exports.menuManager = require('./deprecated/menus_manager');
//module.exports.model = require('./libs/models_manager');
module.exports.moduleManager = require('./deprecated/modules_manager');
module.exports.pluginManager = require('./deprecated/plugins_manager');
//module.exports.widgetManager = require('./libs/widgets_manager');
//module.exports.serviceManager = require('./libs/service_manager');

