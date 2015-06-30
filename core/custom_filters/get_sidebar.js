'use strict';

let Promise = require('bluebird');
let redis = require('redis').createClient();

module.exports = function (env) {
    env.addFilter('get_sidebar', function (sidebarName, route, cb) {
        let key = 'sidebar:' + __config.theme + ':' + sidebarName;

        redis.get(__config.redis_prefix + key, function (err, result) {
            if (result != null) {
                cb(null, result);
            } else {
                let promises = [];
                __models.widgets.findAll({
                    where: {
                        sidebar: sidebarName
                    },
                    order: ['ordering'],
                    raw: true
                }).then(function (widgets) {
                    for (let i in widgets) {
                        if (widgets.hasOwnProperty(i)) {
                            let w = __.getWidget(widgets[i].widget_type);
                            if (w) {
                                promises.push(w.render(widgets[i], route));
                            }
                        }
                    }

                    Promise.all(promises).then(function (results) {
                        let html = results.join('');
                        redis.setex(__config.redis_prefix + key, 3600, html); //caching i one hour,  1 * 60 * 60

                        cb(null, html);
                    });
                });
            }
        });
    }, true);
};
