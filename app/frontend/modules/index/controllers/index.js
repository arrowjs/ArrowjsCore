/**
 * Created by thanhnv on 2/17/15.
 */
'use strict';
/**
 * Module dependencies.
 */
let passport = require('passport');
let util = require('util'),
    config = require(__base + 'config/config.js'),
    redis = require('redis').createClient(),
    _ = require('lodash');

function IndexModule() {
    BaseModuleFrontend.call(this);
    this.path = "/index";
}
let _module = new IndexModule();
_module.index = function (req, res) {
    let index_view = 'index';
    let promise = require('bluebird');
    promise.all([
        __models.posts.findAll({
            limit: 12,
            order: "id desc",
            where: {
                published: 1,
                type: 'post'
            }
        }),
        (function () {
            let key = 'courses-top-course-month';
            return new Promise(function(fulfill, reject) {
                redis.get(config.redis_prefix + key, function (err, results) {
                    if (results != null) {
                        results = JSON.parse(results);
                        fulfill(results);
                    }
                    else {
                        __models.course.findAll({
                            limit: 6,
                            order: "ordering asc"
                        }).then(function (courses) {
                            redis.setex(config.redis_prefix + key, 30, JSON.stringify(courses));
                            fulfill(courses);
                        });
                    }
                });
            })

        })(),
        __models.job.findAll({
            limit: 12,
            order: "id desc"
        }),
        __models.testimonial.findAll()
    ]).then(function(results) {
        _module.render(req, res, index_view, {
            user: req.user || null,
            posts: results[0],
            courses: results[1],
            jobs: results[2],
            testimonials: results[3]
        });
    });

};

util.inherits(IndexModule, BaseModuleFrontend);
module.exports = _module;
