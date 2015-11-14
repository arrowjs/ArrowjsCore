'use strict';

let _ = require('lodash'),
    glob = require('glob'),
    fs = require('fs'),
    util = require('util'),
    fsEx = require('fs-extra'),
    path = require('path'),
    logger = require('./logger'),
    nunjucks = require('nunjucks');


/**
 * Create breadcrumb
 * @param {array} root - Base breadcrumb
 * @returns {array} - Return new breadcrumb
 */
exports.createBreadcrumb = function (root) {
    let arr = root.slice(0);
    for (let i = 1; i < arguments.length; i++) {
        if (arguments[i] != undefined)
            arr.push(arguments[i]);
    }
    return arr;
};

/**
 * Add active class to current menu
 * @param {string} value - Menu link
 * @param {string} string_to_compare - String to compare with menu link
 * @param {string} css_class - CSS class when not use class "active"
 * @param {integer} index
 * @returns {string}
 */
exports.active_menu = function (value, string_to_compare, css_class, index) {
    let arr = value.split('/');
    let st = "active";

    if (css_class) {
        st = css_class;
    }

    if (string_to_compare == '') {
        string_to_compare = 'index';
    }

    if (~string_to_compare.indexOf('/')) {
        string_to_compare = string_to_compare.split('/')[index];
    }

    if (index) {
        let v = arr[index];
        if (!v) {
            v = "index";
        }
        return v === string_to_compare ? st : "";
    }

    return arr[2] == string_to_compare ? st : "";
};

/**
 * Sort menu by "sort" property
 * @param {object} menus
 * @returns {array}
 */
exports.sortMenus = function (menus) {
    let sortable = [];

    // Add menus to array
    for (let m in menus) {
        if (menus.hasOwnProperty(m)) {
            sortable.push({menu: m, sort: menus[m].sort});
        }
    }

    // Sort menu array
    sortable.sort(function (a, b) {
        if (a.sort < b.sort)
            return -1;
        if (a.sort > b.sort)
            return 1;
        return 0;
    });

    return sortable;
};

/**
 * Get widget by alias
 * @param {string} alias
 * @returns {object}
 */
exports.getWidget = function (alias) {
    let widgets = __widget;//require(__dirname + '/widgets_manager')();
    for (let i in widgets) {
        if (widgets.hasOwnProperty(i)) {
            if (widgets[i].config && widgets[i].config.alias == alias) {
                return widgets[i];
            }
        }
    }
};

/**
 * Create Environment to handles templates
 * @param {array} views - List of loaders
 * @returns {object}
 */
exports.createNewEnv = function (views, viewEngineConfig) {
    let self = this;
    let env;

    env = new nunjucks.Environment(new nunjucks.FileSystemLoader(views), viewEngineConfig);
    let viewSetting = viewEngineConfig.express.arrConfig;
    env = self.getAllFunction(env, viewSetting, viewEngineConfig.express._arrApplication);
    env = self.getAllCustomFilter(env, viewSetting, viewEngineConfig.express._arrApplication);
    env = self.getAllVariable(env, viewSetting, viewEngineConfig.express._arrApplication);
    env = self.getAllExtensions(env, viewSetting, viewEngineConfig.express._arrApplication);

    return env;
};

/**
 * Add function to Environment
 * @param {object} env - Environment to add custom filter
 * @returns {object}
 */

exports.getAllVariable = function (env, viewSetting, app) {
    if (!viewSetting.variableFile) return env;
    let userVariable;
    try {
        userVariable = require(path.normalize(__base + viewSetting.variableFile));
    } catch(err) {
        logger.warn('Cant find file :' + path.normalize(__base + viewSetting.variableFile))
    }
    let baseVariable = require(path.resolve(__dirname, '..','templateExtends/variable.js'));

    Object.keys(baseVariable).map(function (name) {
        if (typeof baseVariable[name] !== "function") {
            env.addGlobal(name, baseVariable[name]);
        }
    });


    if (typeof userVariable === 'object' && !_.isEmpty(userVariable)) {
        Object.keys(userVariable).map(function (name) {
            if (typeof userVariable[name] !== "function") {
                env.addGlobal(name, userVariable[name]);
            }
        })
    }
    return env
};


/**
 * Add function to Environment
 * @param {object} env - Environment to add custom filter
 * @returns {object}
 */

exports.getAllExtensions = function (env, viewSetting, app) {
    var self = this;
    let basePath = path.resolve(__dirname, '..', 'templateExtends/Extensions');
    let baseFunctionLinks = self.getGlobbedFiles(path.normalize(basePath + "/*.js"));


    baseFunctionLinks.map(function (link) {
        let viewExtension = require(link);
        let extensionName = path.basename(link, ".js");
        env.addExtension(extensionName, new viewExtension());

    });
    return env
};
/**
 * Add function to Environment
 * @param {object} env - Environment to add custom filter
 * @returns {object}
 */

exports.getAllFunction = function (env, viewSetting, app) {
    let self = this;
    let basePath = path.resolve(__dirname, '..', 'templateExtends/function');
    let baseFunctionLinks = self.getGlobbedFiles(path.normalize(basePath + "/*.js"));
    baseFunctionLinks.map(function (link) {
        let viewFunction = require(link);
        if (typeof viewFunction === 'object' && !_.isEmpty(viewFunction)) {
            let name = path.basename(link, ".js");
            let func = require(link);
            if (typeof func === 'object' && !_.isEmpty(func)) {
                func.name = func.name || name;
                if (func.handler) {
                    func.async = func.async || false;
                    func.handler = func.handler.bind(app);
                    if(func.async) {
                        env.addGlobal(func.name, function () {
                            var argsAsArray = Array.prototype.slice.call(arguments);
                            return func.handler.bind.apply(func.handler, [null].concat(argsAsArray))
                        })
                    } else {
                        env.addGlobal(func.name, func.handler);
                    }
                }
            }
        }
    });

    if (!viewSetting.functionFolder) return env;
    let functionLinks = self.getGlobbedFiles(path.normalize(__base + viewSetting.functionFolder + "/*.js"));
    functionLinks.map(function (link) {
        let viewFunction = require(link);
        if (typeof viewFunction === 'object' && !_.isEmpty(viewFunction)) {
            let name = path.basename(link, ".js");
            let func = require(link);
            if (typeof func === 'object' && !_.isEmpty(func)) {
                func.name = func.name || name;
                if (func.handler) {
                    func.async = func.async || false;
                    func.handler = func.handler.bind(app);
                    if(func.async) {
                        env.addGlobal(func.name, function () {
                            var argsAsArray = Array.prototype.slice.call(arguments);
                            return func.handler.bind.apply(func.handler, [null].concat(argsAsArray))
                        })
                    } else {
                        env.addGlobal(func.name, func.handler);
                    }
                }
            }
        }
    });
    return env
};

/**
 * Add custom filter to Environment
 * @param {object} env - Environment to add custom filter
 * @returns {object}
 */
exports.getAllCustomFilter = function (env, viewSetting, app) {
    let self = this;

    let basePath = path.resolve(__dirname, '..', 'templateExtends/filter');
    let baseFilterLinks = self.getGlobbedFiles(path.normalize(basePath + "/*.js"));


    baseFilterLinks.map(function (link) {
        let name = path.basename(link, ".js")
        let filter = require(link);
        if (typeof filter === 'object' && !_.isEmpty(filter)) {
            filter.name = filter.name || name;
            if (filter.handler) {
                filter.handler = filter.handler.bind(app);
                filter.async = filter.async || false;
                if (filter.async) {
                    env.addFilter(filter.name, filter.handler, true)
                } else {
                    env.addFilter(filter.name, filter.handler)
                }
            }
        }
    });
    if (!viewSetting.filterFolder) return env;
    let filterLinks = self.getGlobbedFiles(path.normalize(__base + viewSetting.filterFolder + "/*.js"));
    filterLinks.map(function (link) {
        let name = path.basename(link, ".js");
        let filter = require(link);
        if (typeof filter === 'object' && !_.isEmpty(filter)) {
            filter.name = filter.name || name;
            if (filter.handler) {
                filter.handler = filter.handler.bind(app);
                filter.async = filter.async || false;
                if (filter.async) {
                    env.addFilter(filter.name, filter.handler, true)
                } else {
                    env.addFilter(filter.name, filter.handler)
                }
            }
        }
    });
    return env
};

/**
 * Add global variables to Environment
 * @param {object} env - Environment to add global variable
 * @returns {object}
 */
exports.getAllGlobalVariable = function (env) {
    env.addGlobal('create_link', function (module_name, link) {
        return module_name + '/' + link;
    });
    return env;
};

/**
 * Parse query conditions with column type
 * @param {string} column_name
 * @param {string} value
 * @param {string} col
 * @returns {string}
 */
exports.parseCondition = function (column_name, value, col) {
    if (col.filter.filter_key) {
        column_name = col.filter.filter_key;
    }

    column_name = (col.filter.model ? (col.filter.model + '.') : '') + column_name;
    column_name = column_name.replace(/(.*)\.(.*)/, '"$1"."$2"');

    if (col.filter.data_type == 'array') {
        return column_name + ' @> ?';
    } else if (col.filter.data_type == 'string') {
        return column_name + ' ilike ?';
    } else if (col.filter.data_type == 'datetime') {
        return column_name + " between ?::timestamp and ?::timestamp";
    } else {
        if (~value.indexOf('><') || col.filter.type == 'datetime') {
            return column_name + " between ? and ?";
        } else if (~value.indexOf('<>')) {
            return column_name + " not between ? and ?";
        } else if (~value.indexOf('>=')) {
            return column_name + " >= ?";
        } else if (~value.indexOf('<=')) {
            return column_name + " <= ?";
        } else if (~value.indexOf('<')) {
            return column_name + " < ?";
        } else if (~value.indexOf('>')) {
            return column_name + " > ?";
        } else if (~value.indexOf(';')) {
            return column_name + " in (?)";
        } else {
            return column_name + " = ?";
        }
    }
};

/**
 * Parse value with data type
 * @param {string} value
 * @param {object} col
 * @returns {string}
 */
exports.parseValue = function (value, col) {
    if (col.filter.data_type == 'array') {
        return '{' + value + '}';
    }

    if (col.filter.data_type == 'datetime') {
        return value.split(/\s+-\s+/);
    } else if (col.filter.data_type == 'string') {
        value = "%" + value + "%";
    } else if (col.filter.data_type == 'bytes') {
        let match = /([0-9]+)\s*(.*)/g.exec(value);
        if (match) {
            let unit = match[2];
            value = match[1];

            switch (unit.toLowerCase()) {
                case "kb":
                    value = value * 1000;
                    break;
                case 'mb':
                    value = value * 1000 * 1000;
                    break;
                case "gb":
                    value = value * 1000 * 1000 * 1000;
                    break;
            }
            return value;
        }
    }

    if (~value.indexOf('><')) {
        return value.split('><');
    } else if (~value.indexOf('<>')) {
        return value.split('<>');
    } else {
        return value.replace(/[><]/g, "");
    }
};

/**
 * Create filter column for standard table
 * @param {object} req - Request
 * @param {object} res - Response
 * @param {route} route - Module name
 * @param {string} reset_link - Link to create button reset filter
 * @param {string} current_column - Current column used to sorting
 * @param {string} order - Current "order by" used to sorting
 * @param {string} columns - List of columns which display in table
 * @param {string} customCondition - Custom conditions
 * @returns {object}
 */
exports.createFilter = function (req, res, route, reset_link, current_column, order, columns, customCondition) {
    if (route != '') {
        res.locals.searchButton = __acl.customButton(route);
        res.locals.resetFilterButton = __acl.customButton(reset_link);
    }

    let conditions = [];
    let values = [];
    let attributes = [];
    values.push('command');

    let getColumn = function (name) {
        for (let i in columns) {

            if (columns[i].column == name) {
                return columns[i];
            }
        }
        return {filter: {}};
    };

    for (let i in req.query) {
        if (req.query[i] != '') {
            let col = getColumn(i);
            if (!col) continue;
            if (col.query) {
                conditions.push(col.query);
            } else {
                conditions.push(__.parseCondition(i, req.query[i], col));
            }

            let filterType = col.filter.data_type;
            let isDateRange = req.query[i].match(/^[0-9]{4}-[0-9]{2}-[0-9]{2} - [0-9]{4}-[0-9]{2}-[0-9]{2}$/);
            let value = null;
            if (filterType != 'datetime' || (filterType == 'datetime' && isDateRange != null)) {
                value = __.parseValue(req.query[i], col);
            } else {
                value = __.parseValue('1970-01-01 - 1970-01-01', col);
            }

            if (Array.isArray(value)) {
                for (let y in value) {
                    values.push(value[y].trim());
                }
            } else {
                values.push(value);
            }
        }
    }

    for (let i in columns) {
        if (columns[i].column != '') attributes.push(columns[i].column);
    }

    let tmp = conditions.length > 0 ? "(" + conditions.join(" AND ") + ")" : " 1=1 ";
    values[0] = tmp + (customCondition ? customCondition : '');

    res.locals.table_columns = columns;
    res.locals.currentColumn = current_column;
    res.locals.currentOrder = order;
    res.locals.filters = req.query;

    if (current_column.indexOf('.') > -1) current_column = current_column.replace(/(.*)\.(.*)/, '"$1"."$2"');

    return {
        values: values,
        attributes: attributes,
        sort: current_column + " " + order
    };
};

/**
 * Convert filter values to String (use in raw query)
 * @param {Array} filterValues - Values of filter which created by createFilter
 * @returns {string}
 */
exports.toRawFilter = function (filterValues) {
    let conditions = filterValues[0].split('?');
    for (let i = 0; i < conditions.length - 1; i++) conditions[i] += "'" + filterValues[i + 1] + "'";
    return conditions.join('');
};

/**
 * Generate random string from possible string
 * @param {integer} length - Length of random string
 * @returns {string}
 */
exports.randomSalt = function (length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

/**
 * Send mail with provided options
 * @param {object} mailOptions
 * @returns {Promise}
 */
exports.sendMail = function (mailOptions) {
    return new Promise(function (fulfill, reject) {
        __mailSender.sendMail(mailOptions, function (err, info) {

            if (err) {
                reject(err);
            } else {
                fulfill(info);
            }
        });
    });
};

/**
 * Check security of file by regex
 * @param {string} file_path
 * @returns {object}
 */
exports.checkFileSecurity = function (file_path) {
    let content = fs.readFileSync(file_path).toString();
    let result = {};

    // Check file activities
    let fileCheck = [
        "readFile",
        "readFileSync"
    ];
    let fileCheckRegex = new RegExp(fileCheck.join('|'), 'g');
    if (content.match(fileCheckRegex) != null) {
        result.file_activities = "Read files";
    }

    // Check database activities
    let databaseCheck = [
        "__models"
    ];
    let databaseCheckRegex = new RegExp(databaseCheck.join('|'), 'g');
    if (content.match(databaseCheckRegex) != null) {
        result.database_activities = "Connect database";
    }

    // Set file path
    if (result.hasOwnProperty('file_activities') || result.hasOwnProperty('database_activities')) {
        result.file_path = file_path.replace(__base + 'app/', '');
    }

    return result;
};

/**
 * Check security of all file in directory
 * @param {string} path
 * @param {Array} result
 * @returns {boolean}
 */
exports.checkDirectorySecurity = function (path, result) {
    try {
        let files = fs.readdirSync(path);

        if (files.length > 0) {
            files.forEach(function (file) {
                let file_path = path + '/' + file;

                if (fs.lstatSync(file_path).isDirectory()) {
                    __.checkDirectorySecurity(file_path, result);
                } else {
                    result.push(__.checkFileSecurity(file_path));
                }
            });
        }
    } catch (ex) {
        return false;
    }
};

/**
 * Translate text with language in lang folder
 * @params {string} - String arguments to translate, argument 0 is translate key
 * @returns {string} - Translated string or Undefined if translate key is not exists
 */
exports.t = function () {
    let self = this;

    let currentLang = this._config.app.language;
    let args = Array.prototype.slice.call(arguments);
    args[0] = __lang[currentLang][args[0]] || 'Undefined';
    return util.format.apply(util, args);
};


/**
 * Get files by glob patterns
 */
module.exports.getGlobbedFiles = function (globPatterns, removeRoot) {
    // For context switching
    let _this = this;

    // URL paths regex
    let urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    let output = [];

    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(function (globPattern) {
            output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
        });
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else {
            var files = glob.sync(globPatterns);
            if (removeRoot) {
                files = files.map(function (file) {
                    return file.replace(removeRoot, '');
                })
            }

            output = _.union(output, files);
        }
    }

    return output;
};

/**
 * Replace paths with same name in "checkIndex" position (calculate from end string when split with "/")
 */
module.exports.overrideCorePath = function (paths, routePath, checkIndex) {
    let arr_path = routePath.split('/');
    let checkName = arr_path[arr_path.length - checkIndex];

    let check_obj = {};
    check_obj[checkName] = routePath;

    _.assign(paths, check_obj);
    return paths;
};

/**
 * Replace core paths with app paths if they have same name in "checkIndex" position using overrideCorePath
 */
module.exports.getOverrideCorePath = function (corePath, appPath, checkIndex) {
    let paths = [];
    let self = this;

    self.getGlobbedFiles(corePath).forEach(function (routePath) {
        paths = self.overrideCorePath(paths, routePath, checkIndex);
    });

    self.getGlobbedFiles(appPath).forEach(function (routePath) {
        paths = self.overrideCorePath(paths, routePath, checkIndex);
    });

    return paths;
};

module.exports.getOverrideArrayPath = function (arrayPath) {


};

/**
 * Merge all paths in same directory
 */
module.exports.mergePath = function (paths, routePath, checkIndex) {
    let arr_path = routePath.split('/');
    let checkName = arr_path[arr_path.length - checkIndex];

    if (paths.hasOwnProperty(checkName)) {
        paths[checkName].push(routePath);
    } else {
        paths[checkName] = [routePath];
    }

    return paths;
};

/**
 * Get the modules JavaScript files
 */
module.exports.getJavaScriptAssets = function (includeTests) {
    let output = this.getGlobbedFiles(this.assets.lib.js.concat(this.assets.js), 'public/');

    // To include tests
    if (includeTests) {
        output = _.union(output, this.getGlobbedFiles(this.assets.tests));
    }

    return output;
};

/**
 * Get the modules CSS files
 */
module.exports.getCSSAssets = function () {
    return this.getGlobbedFiles(this.assets.lib.css.concat(this.assets.css), 'public/');
};

/**
 * Get raw config file
 */

module.exports.getRawConfig = function getRawConfig() {
    let conf = {};

    //get config.js
    try {
        fs.accessSync(__base + 'config/config.js');
        _.assign(conf, require(__base + 'config/config'));
    } catch (err) {
        fsEx.copySync(path.resolve(__dirname, '..', 'config/config.js'), __base + 'config/config.js');
        _.assign(conf, require(__base + 'config/config'));
    }

    //get mail.js
    try {
        fs.accessSync(__base + 'config/mail.js');
        _.assign(conf, require(__base + 'config/mail'));
    } catch (err) {
        fsEx.copySync(path.resolve(__dirname, '..', 'config/mail.js'), __base + 'config/mail.js');
        _.assign(conf, require(__base + 'config/mail'));
    }

    //get redis.js
    try {
        fs.accessSync(__base + 'config/redis.js');
        _.assign(conf, require(__base + 'config/redis'));
    } catch (err) {
        fsEx.copySync(path.resolve(__dirname, '..', 'config/redis.js'), __base + 'config/redis.js');
        _.assign(conf, require(__base + 'config/redis'));
    }

    //get view.js
    try {
        fs.accessSync(__base + 'config/view.js');
        _.assign(conf, require(__base + 'config/view'));
    } catch (err) {
        fsEx.copySync(path.resolve(__dirname, '..', 'config/view.js'), __base + 'config/view.js');
        _.assign(conf, require(__base + 'config/view'));
    }

    //get session.js
    try {
        fs.accessSync(__base + 'config/session.js');
    } catch (err) {
        fsEx.copySync(path.resolve(__dirname, '..', 'config/session.js'), __base + 'config/session.js');
    }

    //get i18n.js
    try {
        fs.accessSync(__base + 'config/i18n.js');
        _.assign(conf, require(__base + 'config/i18n'));
    } catch (err) {
        fsEx.copySync(path.resolve(__dirname, '..', 'config/i18n.js'), __base + 'config/i18n.js');
        _.assign(conf, require(__base + 'config/i18n'));
    }

    //get passport.js
    try {
        fs.accessSync(__base + 'config/passport.js');
    } catch (err) {
        fsEx.copySync(path.resolve(__dirname, '..', 'config/passport.js'), __base + 'config/passport.js');
    }

    //setup strategy
    this.createDirectory('config/strategies');
    try {
        fs.accessSync(__base + 'config/strategies/local.js');
    } catch (err) {
        fsEx.copySync(path.resolve(__dirname, '..', 'config/strategies/local.js'), __base + 'config/strategies/local.js');
    }

    try {
        fs.accessSync(__base + 'config/strategies/google.js');
    } catch (err) {
        fsEx.copySync(path.resolve(__dirname, '..', 'config/strategies/google.js'), __base + 'config/strategies/google.js');
    }

    try {
        fs.accessSync(__base + 'config/strategies/facebook.js');
    } catch (err) {
        fsEx.copySync(path.resolve(__dirname, '..', 'config/strategies/facebook.js'), __base + 'config/strategies/facebook.js');
    }

    //get default config
    try {
        fs.accessSync(__base + 'config/env/default.js');
        _.assign(conf, require(__base + 'config/env/default'));
    } catch (err) {
        fsEx.copySync(path.resolve(__dirname, '..', 'config/env/default.js'), __base + 'config/env/default.js');
        _.assign(conf, require(__base + 'config/env/default'));
    }

    //get ENV config
    let env = process.env.NODE_ENV || "development";
    try {
        fs.accessSync(__base + 'config/env/' + env + ".js");
        _.assign(conf, require(__base + 'config/env/' + env));
    } catch (err) {
        fsEx.copySync(path.resolve(__dirname, '..', 'config/env/development.js'), __base + 'config/env/' + env + '.js');
        _.assign(conf, require(__base + 'config/env/' + env));
    }
    return conf
};
/**
 *
 * @returns {{}}
 */
module.exports.getStructure = function getStructure() {
    let structure = {};
    try {
        fs.accessSync(__base + 'config/structure.js');
        _.assign(structure, require(__base + 'config/structure'));
    } catch (err) {
        if (err.code === 'ENOENT') {
            fsEx.copySync(path.resolve(__dirname, '..', 'config/structure.js'), __base + 'config/structure.js');
            _.assign(structure, require(__base + 'config/structure'));
        } else {
            throw err
        }

    }
    return structure;
};

/**
 * Create directory
 * @param {string} path
 * return {void}
 */
exports.createDirectory = function (path) {
    fs.mkdir(__base + path, function (err) {
        if (err == null) console.log('Create directory ' + path);
    });
};