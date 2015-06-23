'use strict';

let util = require('util'),
    _ = require('lodash');
let redis = require('redis').createClient();
let Promise = require("bluebird");
let fs = require("fs");
let readFileAsync = Promise.promisify(fs.readFile);

let route = 'modules';

let _module = new BackModule('widgets');

_module.index = function (req, res) {
    _module.render(req, res, 'index', {
        title: "All Widgets",
        widgets: __widgets
    });
};

_module.sidebar = function (req, res, next) {
    res.locals.customButtons = [{
        name: "Xóa bộ nhớ đệm",
        cls: "btn btn-danger",
        link: "/admin/widgets/sidebars/clear"
    }];

    readFileAsync(__base + "themes/frontend/" + __config.themes + "/theme.json", "utf8").then(function (data) {
        _module.render(req, res, 'sidebars', {
            title: "Sidebars",
            sidebars: JSON.parse(data).sidebars,
            widgets: __widgets
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

module.exports = _module;