'use strict';

var Promise = require('bluebird'),
    fs = require('fs'),
    _ = require('lodash');

var _base_config = {
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

// Base constructor
function BaseWidget() {
    _.assign(this, _base_config);
    this.env = __.createNewEnv([__base + 'core/widgets/', __base + "themes/frontend/" + __config.themes + "/_widgets/"]);
}
BaseWidget.prototype.getAllLayouts = function (alias) {
    let files = [];

    __config.getGlobbedFiles(__base + "themes/frontend/" + __config.themes + '/_widgets/' + alias + '/*.html').forEach(function (path) {
        let s = path.split('/');
        files.push(s[s.length - 1]);
    });
    if (files.length == 0) {
        __config.getGlobbedFiles(__base + "themes/frontend/default/_widgets/" + alias + "/*.html").forEach(function (path) {
            let s = path.split('/');
            files.push(s[s.length - 1]);
        });
    }

    return files;
};

BaseWidget.prototype.save = function (data) {
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
                ordering: data.ordering
            }).then(function (widget) {
                done(widget.id);
            });
        }

    });
};

BaseWidget.prototype.render_setting = function (widget_type, widget) {
    let _this = this;
    return new Promise(function (done, reject) {
        _this.env.render(widget_type + '/setting.html', {widget: widget, widget_type: widget_type, files: _this.files},
            function (err, re) {
                done(re);
            }).catch(function (err) {
                reject(err);
            });
    });

};

//Render v
BaseWidget.prototype.render = function (widget, data) {
    let _this = this;

    return new Promise(function (resolve, reject) {
        let renderWidget = Promise.promisify(_this.env.render, _this.env);
        let widgetFile = widget.widget_type + '/' + widget.data.file;
        let widgetFilePath = __base + 'themes/frontend/' + __config.themes + '/_widgets/' + widgetFile;

        if (!fs.existsSync(widgetFilePath)) {
            widgetFilePath = 'default/_widgets/' + widgetFile;
        } else {
            widgetFilePath = __base + 'themes/frontend/' + __config.themes + '/_widgets/' + widgetFile;
        }

        if (widgetFilePath.indexOf('.html') == -1) {
            widgetFilePath += '.html';
        }

        let context = _.assign({widget: widget}, data);
        resolve(renderWidget(widgetFilePath, context).catch(function (err) {
            return "<p>" + err.cause;
        }));
    });
};

module.exports = BaseWidget;
