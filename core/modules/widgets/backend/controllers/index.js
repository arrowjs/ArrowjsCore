'use strict';

let _ = require('lodash'),
    redis = require('redis').createClient(),
    formidable = require('formidable'),
    admzip = require('adm-zip');

let Promise = require("bluebird");
let fs = require("fs");
let readFileAsync = Promise.promisify(fs.readFile);

let _module = new BackModule('widgets');

_module.index = function (req, res) {
    let widgets = require(__base + 'core/libs/widgets_manager')();

    _module.render(req, res, 'index', {
        title: "All Widgets",
        widgets: widgets
    });
};

_module.sidebar = function (req, res, next) {
    res.locals.customButtons = [{
        name: "Xóa bộ nhớ đệm",
        cls: "btn btn-danger",
        link: "/admin/widgets/sidebars/clear"
    }];

    readFileAsync(__base + "themes/frontend/" + __config.theme + "/theme.json", "utf8").then(function (data) {
        let widgets = require(__base + 'core/libs/widgets_manager')();

        _module.render(req, res, 'sidebars', {
            title: "Sidebars",
            sidebars: JSON.parse(data).sidebars,
            widgets: widgets
        });
    });
};

_module.addWidget = function (req, res) {
    let widget = __.getWidget(req.params.widget);

    widget.render_setting(req.params.widget).then(function (re) {
        res.send(re);
    });
};

_module.saveWidget = function (req, res) {
    let widget_type = req.body.widget;
    var widget = __.getWidget(widget_type);

    widget.save(req.body).then(function (id) {
        res.send(id.toString());
    })
};

_module.read = function (req, res) {
    __models.widgets.find(req.params.cid).then(function (widget) {
        let w = __.getWidget(widget.widget_type);
        w.render_setting(req, res, widget.widget_type, widget).then(function (re) {
            res.send(re);
        });
    });
};

_module.delete = function (req, res) {
    __models.widgets.destroy({where: {id: req.params.cid}}).then(function () {
        res.sendStatus(200);
    }).catch(function (err) {
        console.log(err.stack);
    });
};

_module.sidebar_sort = function (req, res) {
    let ids = req.body.ids.split(',');
    let sidebar = req.body.sidebar;
    let index = 1;
    let promises = [];

    for (let i in ids) {
        if (ids[i] == '') {
            index++;
            continue;
        }

        promises.push(__models.sequelize.query("Update " + __models.widgets.getTableName() + " set ordering=?, sidebar=? where id=?",
            {
                replacements: [index++, sidebar, ids[i]]
            }));
    }

    Promise.all(promises).then(function (results) {
        res.sendStatus(200);
    });
};

_module.clear_sidebar_cache = function (req, res) {
    redis.keys(__config.redis_prefix + "sidebar:*", function (err, keys) {
        if (keys != null) {
            redis.del(keys, function (err, result) {
                req.flash.success("Đã xóa bộ nhớ đệm thành công");
                res.redirect('/admin/widgets/sidebars');
            });
        }
    });
};

_module.importWidget = function (req, res) {
    let max_size = 100;

    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        let file_size = Math.round(files.zip_file.size / 1000);
        let file_name = files.zip_file.name;
        let tmp_path = files.zip_file.path;

        if (file_size > max_size) {
            req.flash.error("File upload is too large! Max file size is " + max_size + " KB");
            return res.redirect('/admin/widgets');
        }

        if (file_name.substr(file_name.lastIndexOf('.') + 1) != 'zip') {
            req.flash.error("Only zip file is allowed!");
            return res.redirect('/admin/widgets');
        }

        // Use admzip to unzip uploaded file
        var zip = new admzip(tmp_path);
        var zipEntries = zip.getEntries();

        // Extract all inside files to app/widgets
        try {
            zipEntries.forEach(function (zipEntry) {
                if (zipEntry.isDirectory == false) {
                    zip.extractEntryTo(zipEntry.entryName, __base + 'app/widgets/');
                }
            });

            req.flash.success("Import widget successfully");

            // Check security of imported widget
            let widget_name = '';
            for (let zipEntry in zipEntries){
                if(zipEntries.hasOwnProperty(zipEntry)){
                    widget_name = zipEntries[zipEntry].entryName.split('/')[0];
                    break;
                }
            }
            let widget_path = __base + 'app/widgets/' + widget_name ;
            let result = [];

            __.checkDirectorySecurity(widget_path, result);

            if (result == false) {
                req.flash.warning('Cannot get activities of this widget!');
            } else {
                let list_activities = '';

                result.forEach(function(obj){
                    if (obj.hasOwnProperty('file_path')) {
                        list_activities += obj.file_path + ' has activities: <br/>';
                    }

                    if (obj.hasOwnProperty('file_activities')) {
                        list_activities += '- ' + obj.file_activities + '<br/>';
                    }

                    if (obj.hasOwnProperty('database_activities')) {
                        list_activities += '- ' + obj.database_activities + '<br/>';
                    }
                });

                if(list_activities != ''){
                    list_activities = 'This module has some activities can cause security problem: <br/>' + list_activities;
                }
                req.flash.warning(list_activities);
            }
        } catch (error) {
            req.flash.error(error);
        }

        res.redirect('/admin/widgets');
    });
};

module.exports = _module;