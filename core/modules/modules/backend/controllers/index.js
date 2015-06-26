'use strict';

let path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    redis = require('redis').createClient(),
    formidable = require('formidable'),
    admzip = require('adm-zip');

let _module = new BackModule('modules');

_module.index = function (req, res) {
    _module.render(req, res, 'index', {
        title: "All Modules",
        modules: __modules
    });
};

_module.checkSecurity = function (req, res) {
    let module_path = __base + 'app/modules/' + req.params.alias;
    let result = [];

    __.checkDirectorySecurity(module_path, result);

    if (result == false) {
        res.send('Cannot get activities of this module!');
    } else {
        res.send(result);
    }
};

_module.active = function (req, res) {
    let module = __modules[req.params.alias];

    if (module.active == undefined || module.active == false) {
        req.flash.success('Module ' + module.title + ' has been activated');
        module.active = true;
    } else {
        req.flash.warning('Module ' + module.title + ' has been deactivated');
        module.active = false;
    }

    redis.set(__config.redis_prefix + 'all_modules', JSON.stringify(__modules), redis.print);
    return res.redirect('/admin/modules');
};

_module.reload = function (req, res) {
    let mm = require(__base + 'core/libs/modules_manager.js');
    mm.loadAllModules();

    req.flash.success("Reload all modules successfully");
    res.redirect('/admin/modules');
};

_module.importModule = function (req, res) {
    let core_modules = ['blog', 'configurations', 'dashboard', 'menus', 'modules', 'plugins', 'roles', 'uploads', 'users', 'widgets'];
    let max_size = 100;

    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        let file_size = Math.round(files.zip_file.size / 1000);
        let file_name = files.zip_file.name;
        let tmp_path = files.zip_file.path;

        if (file_size > max_size) {
            req.flash.error("File upload is too large! Max file size is " + max_size + " KB");
            return res.redirect('/admin/modules');
        }

        if (file_name.substr(file_name.lastIndexOf('.') + 1) != 'zip') {
            req.flash.error("Only zip file is allowed!");
            return res.redirect('/admin/modules');
        }

        // Use admzip to unzip uploaded file
        var zip = new admzip(tmp_path);
        var zipEntries = zip.getEntries();

        try {
            let extract = true;

            for (let zipEntry in zipEntries){
                if(zipEntries.hasOwnProperty(zipEntry)){
                    let entry = zipEntries[zipEntry];

                    // Check if imported module has same name as core module
                    if(core_modules.indexOf(entry.entryName.split('/')[0]) > -1){
                        req.flash.error('Cannot import module has same name as core module. Please import manually!');
                        extract = false;
                        break;
                    }

                    // Extract all inside files to app/modules
                    if (entry.isDirectory == false) {
                        zip.extractEntryTo(entry.entryName, __base + 'app/modules/');
                    }
                }
            }

            // Reload all modules
            let mm = require(__base + 'core/libs/modules_manager.js');
            mm.loadAllModules();

            if(extract) req.flash.success("Import module successfully");
        } catch (error) {
            req.flash.error(error);
        }

        res.redirect('/admin/modules');
    });
};

//todo: don't import module has same name as core, this action can only manually

module.exports = _module;
