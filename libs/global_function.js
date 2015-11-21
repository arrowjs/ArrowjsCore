'use strict';

const _ = require('lodash'),
    glob = require('glob'),
    fs = require('fs'),
    fsEx = require('fs-extra'),
    path = require('path'),
    logger = require('./logger'),
    nunjucks = require('nunjucks');


/**
 * Create Environment to handles templates
 * @param {array} views - List of loaders
 * @returns {object}
 */
exports.createNewEnv = function (views, viewEngineConfig, application) {
    let self = this;
    let env = new nunjucks.Environment(new nunjucks.FileSystemLoader(views), viewEngineConfig);
    let viewSetting = application.getConfig();
    env = self.getAllFunction(env, viewSetting, application);
    env = self.getAllCustomFilter(env, viewSetting, application);
    env = self.getAllVariable(env, viewSetting, application);
    env = self.getAllExtensions(env, viewSetting, application);

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
    } catch (err) {
        logger.warn('Cant find file :' + path.normalize(__base + viewSetting.variableFile))
    }
    let baseVariable = require(path.resolve(__dirname, '..', 'templateExtends/variable.js'));

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
    let basePath = path.resolve(__dirname, '..', 'templateExtends/extensions');
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
                    if (func.async) {
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
                    if (func.async) {
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

///**
// * Send mail with provided options
// * @param {object} mailOptions
// * @returns {Promise}
// */
//exports.sendMail = function (mailOptions) {
//    return new Promise(function (fulfill, reject) {
//        __mailSender.sendMail(mailOptions, function (err, info) {
//
//            if (err) {
//                reject(err);
//            } else {
//                fulfill(info);
//            }
//        });
//    });
//};

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
 * Scan folder config and read all configuration file. If configuration file does not exists then copy default
 * configuration file from Arrowjs module to folder config
 */

module.exports.getRawConfig = function getRawConfig() {
    let conf = {};

    //get config.js
    try {
        fs.accessSync(__base + 'config/config.js');
        _.assign(conf, require(__base + 'config/config'));
    } catch (err) {
        if (err.code === 'ENOENT') {
            fsEx.copySync(path.resolve(__dirname, '..', 'config/config.js'), __base + 'config/config.js');
            _.assign(conf, require(__base + 'config/config'));
        } else {
            throw err
        }
    }


    //get websocket.js
    try {
        fs.accessSync(__base + 'config/websocket.js');
        _.assign(conf, require(__base + 'config/websocket'));
    } catch (err) {
        if (err.code === 'ENOENT') {
            fsEx.copySync(path.resolve(__dirname, '..', 'config/websocket.js'), __base + 'config/websocket.js');
            _.assign(conf, require(__base + 'config/websocket'));
        } else {
            throw err
        }
    }

    //get error.js
    try {
        fs.accessSync(__base + 'config/error.js');
        _.assign(conf, require(__base + 'config/error'));
    } catch (err) {
        if (err.code === 'ENOENT') {
            fsEx.copySync(path.resolve(__dirname, '..', 'config/error.js'), __base + 'config/error.js');
            _.assign(conf, require(__base + 'config/error'));
        } else {
            throw err
        }
    }

    //get redis.js
    try {
        fs.accessSync(__base + 'config/redis.js');
        _.assign(conf, require(__base + 'config/redis'));
    } catch (err) {
        if (err.code === 'ENOENT') {
            fsEx.copySync(path.resolve(__dirname, '..', 'config/redis.js'), __base + 'config/redis.js');
            _.assign(conf, require(__base + 'config/redis'));
        } else {
            throw err
        }
    }

    //get view.js
    try {
        fs.accessSync(__base + 'config/view.js');
        _.assign(conf, require(__base + 'config/view'));
    } catch (err) {
        if (err.code === 'ENOENT') {
            fsEx.copySync(path.resolve(__dirname, '..', 'config/view.js'), __base + 'config/view.js');
            _.assign(conf, require(__base + 'config/view'));
        } else {
            throw err
        }
    }

    //get session.js
    try {
        fs.accessSync(__base + 'config/session.js');
    } catch (err) {
        if (err.code === 'ENOENT') {
            fsEx.copySync(path.resolve(__dirname, '..', 'config/session.js'), __base + 'config/session.js');
        } else {
            throw err
        }
    }

    //get i18n.js
    try {
        fs.accessSync(__base + 'config/i18n.js');
        _.assign(conf, require(__base + 'config/i18n'));
    } catch (err) {
        if (err.code === 'ENOENT') {
            fsEx.copySync(path.resolve(__dirname, '..', 'config/i18n.js'), __base + 'config/i18n.js');
            _.assign(conf, require(__base + 'config/i18n'));
        } else {
            throw err
        }
    }

    //get passport.js
    try {
        fs.accessSync(__base + 'config/passport.js');
    } catch (err) {
        if (err.code === 'ENOENT') {
            fsEx.copySync(path.resolve(__dirname, '..', 'config/passport.js'), __base + 'config/passport.js');
        } else {
            throw err
        }
    }

    //get database.js
    try {
        fs.accessSync(__base + 'config/database.js');
    } catch (err) {
        if (err.code === 'ENOENT') {
            fsEx.copySync(path.resolve(__dirname, '..', 'config/database.js'), __base + 'config/database.js');
        } else {
            throw err
        }
    }

    //setup strategy
    this.createDirectory('config/strategies');
    try {
        fs.accessSync(__base + 'config/strategies/local.js');
    } catch (err) {
        if (err.code === 'ENOENT') {
            fsEx.copySync(path.resolve(__dirname, '..', 'config/strategies/local.js'), __base + 'config/strategies/local.js');
        } else {
            throw err
        }
    }


    //get ENV config
    let env = process.env.NODE_ENV || "development";
    try {
        fs.accessSync(__base + 'config/env/' + env + ".js");
        _.assign(conf, require(__base + 'config/env/' + env));
    } catch (err) {
        if (err.code === 'ENOENT') {
            fsEx.copySync(path.resolve(__dirname, '..', 'config/env/development.js'), __base + 'config/env/' + env + '.js');
            _.assign(conf, require(__base + 'config/env/' + env));
        } else {
            th
        }
    }
    return conf
};
/**
 * Read file config/structure.js and return structure object
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