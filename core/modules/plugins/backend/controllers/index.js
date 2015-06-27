'use strict';

let _ = require('lodash'),
    redis = require('redis').createClient(),
    fs = require('fs'),
    formidable = require('formidable'),
    admzip = require('adm-zip');

let Promise = require('bluebird');
Promise.promisifyAll(formidable);

let _module = new BackModule('plugins');

function renderView(req, res, env, plugin) {
    env.render('setting.html', {
        title: "Setting Plugins",
        plugin: plugin
    }, function (err, re) {
        if (err) {
            res.send(err);
        } else {
            _module.render(req, res, 'setting.html', {
                setting_form: re,
                plugin: plugin,
                title: 'Chi tiết plugin'
            });
        }
    });
}

_module.index = function (req, res) {
    _module.render(req, res, 'index', {
        title: "All Plugins",
        plugins: __pluginManager.plugins
    });
};

_module.setting = function (req, res) {
    let plugin = __pluginManager.getPlugin(req.params.alias);

    if (fs.existsSync(__base + 'app/plugins/' + req.params.alias + '/setting.html')) {
        let env = __.createNewEnv([__base + 'app/plugins/' + req.params.alias]);
        renderView(req, res, env, plugin);
    } else {
        if (fs.existsSync(__base + 'core/plugins/' + req.params.alias + '/setting.html')) {
            let env = __.createNewEnv([__base + 'core/plugins/' + req.params.alias]);
            renderView(req, res, env, plugin);
        } else {
            _module.render(req, res, 'setting.html', {
                plugin: plugin,
                title: 'Chi tiết plugin'
            });
        }
    }
};

_module.save_setting = function (req, res, next) {
    let plugin = __pluginManager.getPlugin(req.params.alias);
    plugin.options = req.body;

    redis.set(__config.redis_prefix + 'all_plugins', JSON.stringify(__pluginManager.plugins), redis.print);

    req.flash.success("Saved success");
    next();
};

_module.checkSecurity = function (req, res) {
    let plugin_path = __base + 'app/plugins/' + req.params.alias;
    let result = [];

    __.checkDirectorySecurity(plugin_path, result);

    if (result == false) {
        res.send('Cannot get activities of this plugin!');
    } else {
        res.send(result);
    }
};

_module.active = function (req, res) {
    let alias = req.params.alias;
    let plugin = __pluginManager.getPlugin(alias);

    if (plugin.active == undefined || plugin.active == false) {
        req.flash.success('Plugin ' + plugin.name + ' has been activated');
    } else {
        req.flash.warning('Plugin ' + plugin.name + ' has been deactivated');
    }
    plugin.active = !plugin.active;

    redis.set(__config.redis_prefix + 'all_plugins', JSON.stringify(__pluginManager.plugins), redis.print);
    return res.redirect('/admin/plugins');
};

_module.reload = function (req, res) {
    let pm = require(__base + 'core/libs/plugins_manager.js');
    pm.reloadAllPlugins();

    req.flash.success("Reload all plugins successfully");
    res.redirect('/admin/plugins');
};

_module.importPlugin = function (req, res) {
    let max_size = 100;

    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        let file_size = Math.round(files.zip_file.size / 1000);
        let file_name = files.zip_file.name;
        let tmp_path = files.zip_file.path;

        if (file_size > max_size) {
            req.flash.error("File upload is too large! Max file size is " + max_size + " KB");
            return res.redirect('/admin/plugins');
        }

        if (file_name.substr(file_name.lastIndexOf('.') + 1) != 'zip') {
            req.flash.error("Only zip file is allowed!");
            return res.redirect('/admin/plugins');
        }

        // Use admzip to unzip uploaded file
        var zip = new admzip(tmp_path);
        var zipEntries = zip.getEntries();

        // Extract all inside files to app/plugins
        try {
            zipEntries.forEach(function (zipEntry) {
                if (zipEntry.isDirectory == false) {
                    zip.extractEntryTo(zipEntry.entryName, __base + 'app/plugins/');
                }
            });

            // Reload all plugins
            let mm = require(__base + 'core/libs/plugins_manager.js');
            mm.reloadAllPlugins();

            req.flash.success("Import plugin successfully");
        } catch (error) {
            req.flash.error(error);
        }

        res.redirect('/admin/plugins');
    });
};

module.exports = _module;