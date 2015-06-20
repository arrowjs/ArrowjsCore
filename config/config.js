'use strict';

/**
 * Module dependencies.
 */
let _ = require('lodash'),
	glob = require('glob');

/**
 * Load app configurations
 */
module.exports = _.extend(
    require('./env/all.js'),
	require('./env/' + process.env.NODE_ENV) || {}
);

/**
 * Get files by glob patterns
 */
module.exports.getGlobbedFiles = function(globPatterns, removeRoot) {
	// For context switching
	let _this = this;

	// URL paths regex
	let urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

	// The output array
	let output = [];

	// If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob 
	if (_.isArray(globPatterns)) {
		globPatterns.forEach(function(globPattern) {
			output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
		});
	} else if (_.isString(globPatterns)) {
		if (urlRegex.test(globPatterns)) {
			output.push(globPatterns);
		} else {
			glob(globPatterns, {
				sync: true
			}, function(err, files) {
				if (removeRoot) {
					files = files.map(function(file) {
						return file.replace(removeRoot, '');
					});
				}

				output = _.union(output, files);
			});
		}
	}

	return output;
};

/**
 * Replace paths with same name in "checkIndex" position (calculate from end string when split with "/")
 */
module.exports.overrideCorePath = function(paths, routePath, checkIndex){
    let arr_path = routePath.split('/');
    let checkName = arr_path[arr_path.length - checkIndex];

    let check_obj = {};
    check_obj[checkName] = routePath;

    paths = _.assign(paths, check_obj);
    return paths;
};

/**
 * Replace core paths with app paths if they have same name in "checkIndex" position using overrideCorePath
 */
module.exports.getOverrideCorePath = function(corePath, appPath, checkIndex){
    let paths = [];

    __config.getGlobbedFiles(corePath).forEach(function (routePath) {
        paths = __config.overrideCorePath(paths, routePath, checkIndex);
    });

    __config.getGlobbedFiles(appPath).forEach(function (routePath) {
        paths = __config.overrideCorePath(paths, routePath, checkIndex);
    });

    return paths
};

/**
 * Get the modules JavaScript files
 */
module.exports.getJavaScriptAssets = function(includeTests) {
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
module.exports.getCSSAssets = function() {
	let output = this.getGlobbedFiles(this.assets.lib.css.concat(this.assets.css), 'public/');
	return output;
};