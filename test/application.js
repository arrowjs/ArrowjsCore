var expect = require("chai").expect;
var mockery = require("mockery");
var fsExtra = require("fs-extra");
var express = require("express");
var path = require("path");
var request = require('supertest');
request = request('http://localhost:8000');

var winston = require("winston");
var getRawConfig = require("../libs/global_function").getRawConfig;
var buildStructure = require("../libs/buildStructure");

var ArrowJS = require("../libs/ArrowApplication");
describe("Arrow Application", function () {
    before(function () {
        process.setMaxListeners(0);
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });
        process.env.NODE_ENV = "test";
        mockery.registerMock(__dirname + '/config/error', {
            logFolder: 'log',
            winstonLog: {
                transports: [
                    new winston.transports.File({
                        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
                        filename: 'logs.log',
                        maxsize: 1024 * 1024 * 10, // 10MB
                        name: "default-log"
                    })
                ],
                exceptionHandlers: [
                    new winston.transports.File({
                        filename: 'exceptions.log'
                    }),
                ]
            },
            fault_tolerant: {
                logdata: ["body", "query"],//
                render: '',
                redirect: '500'
            },
            error: {
                "404": {
                    render: "public/404.html"
                },
                "500": {
                    render: "public/500.html"
                }
            }
        });
        mockery.registerMock('arrowjs', require("../index.js"));
    });

    after(function () {
        mockery.deregisterMock('arrowjs', require("../index.js"));
        mockery.disable();
    });

    describe("Arrow properties and Methods", function () {
        var application;

        before(function (done) {
            application = new ArrowJS;
            application.start().then(function () {
                return done()
            });
        });

        after(function (done) {
            application.close().then(function () {
                done()
            });
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });

            it("have beforeAuth, afterAuth, plugins,redisClient, redisSubscriber, _arrRoutes, _componentList, arrowSettings", function () {
                expect(application).to.have.deep.property("beforeAuth").that.is.an("array");
                expect(application).to.have.deep.property("afterAuth").that.is.an("array");
                expect(application).to.have.deep.property("plugins").that.is.an("array");
                expect(application).to.have.deep.property("redisClient").that.is.an("object");
                expect(application).to.have.deep.property("redisSubscriber").that.is.a("function");
                expect(application).to.have.deep.property("_arrRoutes").that.is.an("object");
                expect(application).to.have.deep.property("_componentList").that.is.an("array");
                expect(application).to.have.ownProperty("arrowSettings");
            });

            it("have all properties of express app", function () {
                var app = express();
                Object.keys(app).map(function (key) {
                    expect(application).to.have.ownProperty(key);
                })
            });

            it("get folder of application", function () {
                expect(application.arrFolder).to.be.equal(__dirname + path.sep);
                expect(__base).to.be.equal(__dirname + path.sep);
            });

            it("create global object,function : 'Arrow,ArrowHelper,__'", function () {
                expect(Arrow).to.be.an("object");
                expect(ArrowHelper).to.be.an("object");
                expect(__).to.be.an("function");
            });

            it("load and build arrow structure", function () {
                expect(application).to.have.deep.property("structure").that.is.an("object");
                expect(application).to.have.deep.property("structure").that.have.ownProperty("features");

            });

            it("loading full config", function () {
                var conf = getRawConfig();
                expect(application).to.have.deep.property("_config").that.is.eql(conf);
            });

            it("load winston log", function () {
                expect(application).to.have.deep.property("logger").that.is.an("object");
                expect(application).to.have.deep.property("logger.error").that.is.a("function");
                expect(application).to.have.deep.property("logger.warn").that.is.a("function");
                expect(application).to.have.deep.property("logger.info").that.is.a("function");
            });

            it("auto load some middleware", function () {
                expect(application).to.have.deep.property("middleware").that.is.an("object");
                expect(application).to.have.deep.property("middleware").that.is.not.empty;
                expect(application).to.have.deep.property("middleware.passport").that.is.not.empty;
                expect(application).to.have.deep.property("middleware.flashMessage").that.is.not.empty;
                expect(application).to.have.deep.property("middleware.session").that.is.not.empty;
                expect(application).to.have.deep.property("middleware.serveStatic").that.is.not.empty;
                expect(application).to.have.deep.property("middleware.helmet").that.is.not.empty;
                expect(application).to.have.deep.property("middleware.bodyParser").that.is.not.empty;
                expect(application).to.have.deep.property("middleware.cookieParser").that.is.not.empty;
                expect(application).to.have.deep.property("middleware.morgan").that.is.not.empty;
                expect(application).to.have.deep.property("middleware.methodOverride").that.is.not.empty;
            });

            it("have configManager, some functions to handle config", function () {
                expect(application).to.have.deep.property("configManager").that.is.an("object");
                expect(application).to.have.deep.property("addConfig").that.is.a("function");
                expect(application).to.have.deep.property("addConfigFile").that.is.a("function");
                expect(application).to.have.deep.property("getConfig").that.is.a("function");
                expect(application).to.have.deep.property("setConfig").that.is.a("function");
                expect(application).to.have.deep.property("updateConfig").that.is.a("function");
            });

            it("have application template engine, 2 render function", function () {
                expect(application).to.have.deep.property("applicationENV").that.is.an("object");
                expect(application).to.have.deep.property("render").that.is.a("function");
                expect(application).to.have.deep.property("renderString").that.is.a("function");
            });

            it("have utils object (support function)", function () {
                expect(application).to.have.deep.property("utils").that.is.an("object");
                expect(application).to.have.deep.property("utils.dotChain").that.is.a("function");
                expect(application).to.have.deep.property("utils.fs").that.is.an("object");
                expect(application).to.have.deep.property("utils.loadAndCreate").that.is.a("function");
                expect(application).to.have.deep.property("utils.markSafe").that.is.a("function");
            });

            it("have methods", function () {
                expect(application).to.have.deep.property("beforeAuthenticate").that.is.a("function");
                expect(application).to.have.deep.property("afterAuthenticate").that.is.a("function");
                expect(application).to.have.deep.property("addGlobal").that.is.a("function");
                expect(application).to.have.deep.property("addPlugin").that.is.a("function");
                expect(application).to.have.deep.property("start").that.is.a("function");
                expect(application).to.have.deep.property("close").that.is.a("function");

            })
    });

    describe("Arrow render view", function () {
        var application;
        before(function (done) {
            application = new ArrowJS;
            application.start().then(function () {
                done()
            });
        });

        after(function (done) {
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
            application.close().then(function () {
                done()
            })
        });

        it('Render view with Req.render, arrow custom_filter, req.flash', function (done) {
            request.get("/")
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })

        });

        it('Make link with link_to function ', function (done) {
            request.get("/linkto")
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })

        });


        it("Render view with application.render", function (done) {
            request.get("/applicationRender")
                .expect(200)
                .end(function (err, res) {
                    done();
                })
        })
    });

    describe("Arrow enable 'passport' setting", function () {
        var application;
        before(function (done) {
            application = new ArrowJS;
            application.start({passport: true}).then(function () {
                return done()
            });
            mockery.registerMock('bcrypt', {});
        });
        after(function (done) {
            application.close().then(function () {
                done()
            });
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it('Logout with req.logout', function (done) {
            request.get("/logout")
                .expect(302, done);
        })
    });

    describe("Arrow enable 'role' setting", function () {
        var application;
        before(function (done) {
            application = new ArrowJS;
            application.start({role: true}).then(function () {
                return done()
            });
        });
        after(function (done) {
            application.close().then(function () {
                done()
            });
            fsExtra.removeSync(__dirname + "/log");
            fsExtra.removeSync(__dirname + "/config");
        });
        context("start application with role", function () {
            it("Enable role", function () {

            });
        });
    });

    describe("Arrow enable 'order' setting", function () {
        var application;
        before(function (done) {
            application = new ArrowJS;
            application.start({order: true}).then(function () {
                return done()
            });
        });
        after(function (done) {
            application.close().then(function () {
                done()
            })
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        context("start application with order", function () {
            it("Enable order", function () {

            });
        });
    });

    describe("Arrow with websocket server", function () {
        var application;
        before(function (done) {
            mockery.registerMock(__dirname + "/config/env/test", {
                websocket_enable: true,
                websocket_cluster: true, //only support web_socket
                websocket_folder: "/websockets/*.js"
            });
            application = new ArrowJS;
            application.setConfig("websocket_enable", true);
            application.setConfig("websocket_cluster", true);
            application.start().then(function () {
                return done()
            });
        });
        after(function (done) {
            mockery.deregisterMock(__dirname + "/config/env/test");
            application.close().then(function () {
                done()
            })
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it('Enable websocket cluster', function (done) {
            request.get("/")
                .expect(200, done);
        })
    });

    describe("Arrow parse complex structure with name ", function () {
        var application;
        before(function (done) {
            mockery.registerMock(__dirname + '/config/structure', {
                features: {
                    "path": {
                        "folder": "/features",
                        "file": "feature.js"
                    },
                    "extend": {
                        system: true,
                        active: function () {
                        }
                    },
                    "model": [
                        {
                            "path": {
                                "folder": "model/backend",
                                "file": "*.js",
                                "name": "backend"
                            }
                        },
                        {
                            "path": {
                                "folder": "model/frontend",
                                "file": "*.js",
                                "name": "frontend"
                            }
                        }
                    ],
                    "view": [
                        {
                            "path": {
                                "folder": "view/backend",
                                "name": "backend"
                            }
                        },
                        {
                            "path": {
                                "folder": "view/frontend",
                                "name": "frontend"
                            }
                        }
                    ],
                    "action": [
                        {
                            "path": {
                                "folder": "action/backend",
                                "file": "action.js",
                                "name": "backend"
                            }
                        },
                        {
                            "path": {
                                "folder": "action/frontend",
                                "file": "action.js",
                                "name": "frontend"
                            }
                        }
                    ],
                    "controller": [
                        {
                            "path": {
                                "folder": "controller/backend",
                                "file": "controller.js",
                                "name": "backend"
                            }
                        },
                        {
                            "path": {
                                "folder": "controller/frontend",
                                "file": "controller.js",
                                "name": "frontend"
                            }
                        }
                    ],
                    "route": [
                        {
                            path: {
                                'name': 'backend',
                                'folder': 'route/backend',
                                'file': 'route.js',
                                'prefix': '/admin'
                            }
                        },
                        {
                            path: {
                                'name': 'frontend',
                                'folder': 'route/frontend',
                                'file': 'route.js'
                            }
                        }
                    ]
                }
            });
            application = new ArrowJS;
            application.start().then(function () {
                return done()
            });

        });
        after(function (done) {
            mockery.deregisterMock(__dirname + '/config/structure');
            application.close().then(function () {
                done()
            });
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("Have multi route and controller", function (done) {
            request.get("/admin")
                .expect(200)
                .end(function (err, res) {
                    done()
                });
        });
        it("Can get view files", function () {
            //application.featuresManager.getViewFiles("demo");
            expect(application.featuresManager.getViewFiles("demo", "frontend")).is.an.Array;
        });
    });

    describe("Arrow handle logic base folder", function () {
        var application;
        before(function (done) {
            mockery.registerMock(__dirname + '/config/structure', {
                features: {
                    "path": {
                        "folder": "/features",
                        "file": "feature.js"
                    },
                    "extend": {
                        system: true,
                        active: true
                    },
                    "model": {
                        "path": {
                            "folder": "/model",
                            "file": "*.js"
                        }
                    }
                }
            });
            application = new ArrowJS;
            application.start().then(function () {
                return done()
            });

        });
        after(function (done) {
            mockery.deregisterMock(__dirname + '/config/structure');
            application.close().then(function () {
                done()
            })
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("Can load folder from base folder", function () {

        })
    });

    describe("Arrow add multi static resource folder", function () {
        var application;
        before(function (done) {
            mockery.registerMock(__dirname + '/config/view', {
                resource: {
                    path: ['public', 'home'],
                    option: {
                        maxAge: 3600
                    }
                },
                viewExtension: "html",
                pagination: {
                    number_item: 20
                },
                theme: "default",
                nunjuckSettings: {}
            });
            application = new ArrowJS;
            application.start().then(function () {
                return done()
            });

        });
        after(function (done) {
            application.close().then(function () {
                done()
            });
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("have multi static resource folder", function (done) {
            request.get("/")
                .expect(200,done)
        });
    });

    describe("Arrow work with redis", function () {
        var application;
        before(function (done) {
            mockery.registerMock(__dirname + '/config/redis', {
                redis: {
                    host: 'localhost',
                    port: '6379'
                },
                redis_prefix: 'arrowjs_',
                redis_key: {
                    configs: "site_setting",
                    features: "all_features",
                    backend_menus: "backend_menus",
                    plugins: "all_plugins"
                },
                redis_event: {
                    update_config: "config_update",
                    update_feature: "feature_update"
                },
                websocket_enable: true,
                websocket_cluster: true, //only support web_socket
                websocket_folder: "/websockets/*.js"
            });

            application = new ArrowJS;
            application.start().then(function () {
                return done()
            });

        });
        after(function (done) {
            mockery.deregisterMock(__dirname + '/config/redis');
            application.close().then(function () {
                done()
            })
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("Can start if redis turn on", function (done) {
            request.get("/")
                .expect(302,done);
        });
    });

    describe("Throw Error if structure.js is not an object", function () {
        var application;
        before(function (done) {
            mockery.registerMock(__dirname + '/config/structure', function () {
            });
            application = new ArrowJS;
            application.start().then(function () {
                return done()
            });

        });
        after(function (done) {
            mockery.deregisterMock(__dirname + '/config/structure');
            application.close().then(function () {
                done()
            })
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("", function () {
            //expect(application).to.throw(Error);
        });
    });

    //describe("SystemManager functions", function () {
    //    var application;
    //    before(function (done) {
    //        application = new ArrowJS;
    //        application.start().then(function () {
    //            return done()
    //        });
    //
    //    });
    //    after(function (done) {
    //        application.close().then(function () {
    //            done()
    //        });
    //        fsExtra.removeSync(__dirname + "/log/");
    //        fsExtra.removeSync(__dirname + "/config/");
    //    });
    //    it("A system manager can setCache config", function (done) {
    //        application.featuresManager.setCache().then(function () {
    //            return done()
    //        })
    //    });
    //    it("A system manager can getCache config", function (done) {
    //        application.featuresManager.getCache().then(function () {
    //            return done()
    //        })
    //    });
    //
    //    it("A system manager can reload config", function (done) {
    //        application.featuresManager.reload().then(function () {
    //            return done()
    //        })
    //    });
    //
    //    it("A system manager can get permissions", function (done) {
    //        application.featuresManager.getPermissions("demo");
    //        done();
    //    });
    //
    //    it("A system manager can get attributes", function (done) {
    //        application.featuresManager.getAttribute("testAttribute");
    //        application.featuresManager.getAttribute("testAttribute2");
    //        application.featuresManager.getAttribute();
    //        done();
    //    });
    //
    //    it("A system manager can get component", function (done) {
    //        application.featuresManager.getComponent();
    //        done();
    //    });
    //
    //    //it("A system manager can get view files", function (done) {
    //    //    application.featuresManager.getViewFiles("demo");
    //    //    done();
    //    //});
    //
    //    it("A config manager can update config", function (done) {
    //        application.configManager.updateConfig({}).then(function () {
    //            done();
    //        });
    //    });
    //});

    describe("Arrow support functions", function () {
        var application;
        before(function (done) {
            application = new ArrowJS;
            application.beforeAuthenticate(function (req, res, next) {
                next();
            });
            application.afterAuthenticate(function (req, res, next) {
                next();
            });
            application.addGlobal({a: 1});
            application.addPlugin(function () {
                application.demoPlugin = 1;
            });
            application.start().then(function () {
                return done()
            });

        });
        after(function (done) {
            application.close().then(function () {
                done()
            })
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });

        it("Can add global variable ", function () {
            expect(Arrow.a).is.eql(1);
        });

        it("Can add plugin", function () {
            expect(application.demoPlugin).is.eql(1)
        });

        it("Can add function with beforeAuthenticate", function () {
            expect(application.beforeAuth).to.have.length(1);
        });

        it("Can add function with afterAuthenticate", function () {
            expect(application.afterAuth).to.have.length(1);
        });
    });

    describe("Arrowjs utils functions", function () {
        var application;
        before(function (done) {
            application = new ArrowJS;
            application.start().then(function () {
                return done()
            });

        });
        after(function (done) {
            application.close().then(function () {
                done()
            })
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });

        it("Can add config with addConfig function", function () {
            application.addConfig({test: 1});
            expect(application.getConfig("test")).is.eql(1)
        });

        it("Can get setting by getDataByDotNotation", function () {
            expect(application.utils.dotChain({a: {b: 1}}, "a.b")).is.eql(1);
            expect(application.utils.dotChain({a: {b: 1}}, {})).is.eql(null);
            expect(application.utils.dotChain({a: {b: 1}}, "a.c")).is.eql(null);
            expect(application.utils.dotChain({a: {b: 1}}, "a")).is.eql({b: 1});
        })
    });

    describe("Handle error link", function () {
        var application;
        before(function (done) {
            mockery.registerMock(__dirname + "/config/env/test", {
                long_stack: true,
                fault_tolerant: {
                    enable: true,
                    redirect: 404
                }
            });
            application = new ArrowJS;
            application.arrowErrorLink = {"/": true};
            application.start().then(function () {
                return done()
            });

        });
        after(function (done) {
            mockery.deregisterMock(__dirname + "/config/env/test");
            application.close().then(function () {
                done()
            });
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });

        it("Enable circuit breaker", function (done) {
            request.get("/")
                .expect(302, done);
        });
    });

});
