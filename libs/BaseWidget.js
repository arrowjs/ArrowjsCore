'use strict';

let Promise = require('bluebird'),
    fs = require('fs'),
    _ = require('lodash');
let env = __.createNewEnv([__base + 'app/widgets/', __base + 'core/widgets/', __base + "themes/frontend/"]);

class BaseWidget {
    constructor(config) {
        this.config = {
            alias: "Base",
            name: "Base",
            description: "Base",
            author: "Nguyen Van Thanh",
            version: "0.1.0",
            options: {
                id: '',
                cls: '',
                title: '',
                file: ''
            }
        };

        this.env = env;
    }

    getAllLayouts(alias) {
        let files = [];

        __.getGlobbedFiles(__base + "themes/frontend/" + __config.theme + '/_widgets/' + alias + '/*.html').forEach(function (path) {
            let s = path.split('/');
            files.push(s[s.length - 1]);
        });

        if (files.length == 0) {
            __.getGlobbedFiles(__base + "themes/frontend/default/_widgets/" + alias + "/*.html").forEach(function (path) {
                let s = path.split('/');
                files.push(s[s.length - 1]);
            });
        }

        return files;
    }

    save(data) {
        return new Promise(function (done, reject) {
            let json_data = _.clone(data);
            delete json_data.sidebar;
            delete json_data.id;
            json_data = JSON.stringify(json_data);

            if (data.id != '') {
                __models.widgets.findById(data.id).then(function (widget) {
                    widget.updateAttributes({
                        sidebar: data.sidebar,
                        data: json_data
                    }).then(function (widget) {
                        done(widget.id);
                    });
                });
            } else {
                __models.widgets.create({
                    widget_type: data.widget,
                    sidebar: data.sidebar,
                    data: json_data,
                    ordering: data.ordering,
                    created_by: data.created_by
                }).then(function (widget) {
                    done(widget.id);
                });
            }
        });
    }

    render_setting(widget_type, widget) {
        let self = this;

        return new Promise(function (done, reject) {
            self.env.render(widget_type + '/setting.html', {
                    widget: widget,
                    widget_type: widget_type,
                    files: self.files
                },
                function (err, re) {
                    done(re);
                }).catch(function (err) {
                    reject(err);
                });
        });
    }

    render(widget, data) {
        let self = this;

        return new Promise(function (fulfill, reject) {
            let renderWidget = Promise.promisify(self.env.render, self.env);
            let widgetFile = widget.widget_type + '/' + widget.data.file;

            let widgetFilePath = __base + 'themes/frontend/' + __config.theme + '/_widgets/' + widgetFile;

            if (!fs.existsSync(widgetFilePath)) {
                widgetFilePath = __base + 'themes/frontend/default/_widgets/' + widgetFile;
            } else {
                widgetFilePath = __base + 'themes/frontend/' + __config.theme + '/_widgets/' + widgetFile;
            }

            if (widgetFilePath.indexOf('.html') === -1) {
                widgetFilePath += '.html';
            }

            let context = _.assign({widget: widget}, data);

            fulfill(renderWidget(widgetFilePath, context).catch(function (err) {
                return "<p>" + err.cause;
            }));
        });
    }
}

module.exports = BaseWidget;


