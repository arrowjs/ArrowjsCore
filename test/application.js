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
        mockery.registerMock('arrowjs', require("../index.js"));
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
    });

    after(function () {
        mockery.disable();
    });

    describe("Default logic", function () {
        var application;

        before(function (done) {
            application = new ArrowJS;
            application.start().then(function () {
                return done()
            });
        });

        after(function (done) {
            application.close(done);
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });

        context("Checking methods and properties", function () {
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
    });
    describe("Test render function", function () {
        var application;
        before(function (done) {
            application = new ArrowJS;
            application.start().then(function () {
                return done()
            });
        });

        after(function (done) {
            application.close(done);
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });

        it('Can render view with Req.render, arrow custom_filter, req.flash', function (done) {
            request.get("/")
                .expect(200)
                .end(function (err,res) {
                    if (err) return done(err);
                    done();
                })

        });

        it("Can render view with application render", function (done) {
            request.get("/applicationRender")
                .expect(200)
                .end(function (err,res) {
                    if (err) return done(err);
                    done();
                })
        })
    });

    describe("enable passport setting", function () {
        var application;
        before(function (done) {
            application = new ArrowJS;
            application.start({passport: true}).then(function () {
                return done()
            });
            mockery.registerMock('bcrypt', {});
        });
        after(function (done) {
            application.close(done);
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        context("start application with passport", function () {
            it("Enable passport", function () {

            });
            it('can call req.logout', function (done) {
                request.get("/logout")
                    .expect(302, done);
            })
        });
    });

    describe("enable role setting", function () {
        var application;
        before(function (done) {
            application = new ArrowJS;
            application.start({role: true}).then(function () {
                return done()
            });
        });
        after(function (done) {
            application.close(done);
            fsExtra.removeSync(__dirname + "/log");
            fsExtra.removeSync(__dirname + "/config");
        });
        context("start application with role", function () {
            it("Enable role", function () {

            });
        });
    });

    describe("enable order setting", function () {
        var application;
        before(function (done) {
            application = new ArrowJS;
            application.start({role: true}).then(function () {
                return done()
            });
        });
        after(function (done) {
            application.close(done);
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        context("start application with order", function () {
            it("Enable order", function () {

            });
        });
    });


    describe("enable socket server", function () {
        var application;
        before(function (done) {
            application = new ArrowJS;
            application.setConfig("websocket_enable", true);
            application.setConfig("websocket_cluster", true);
            application.start().then(function () {
                return done()
            });
        });
        after(function (done) {
            application.close(done);
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        context("start application with socket", function () {
            it('Get /', function (done) {
                request.get("/")
                    .expect(200, done);
            })
        });
    });


    describe("connect database", function () {
        var application;
        before(function (done) {
            application = new ArrowJS;
            application.setConfig("db", {
                db: {
                    host: 'localhost',
                    port: '5432',
                    database: 'arrowjs',
                    username: 'postgres',
                    password: '',
                    dialect: 'postgres',
                    logging: false
                }
            });
            application.start().then(function () {
                return done()
            });
        });
        after(function (done) {
            application.close(done);
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("Connect to database", function () {

        });
    });
    describe("test with another structure", function () {
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
                            "folder": "/models",
                            "file": "*.js"
                        }
                    },
                    "view": {
                        "path": {
                            "folder": "view"
                        }
                    },
                    "action": {
                        "path": {
                            "folder": "action",
                            "file": "*.js"
                        }
                    },
                    "controller": [{
                        "path": {
                            "folder": "controller",
                            "file": "*.js"
                        },
                        "path": {
                            "folder": "controller",
                            "file": "*.js"
                        }
                    }],
                    "route": {
                        "path": {
                            "file": "route.js"
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
            application.close(done);
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("test with another structure", function () {

        });
    });

    describe("have multi static resource folder", function () {
        var application;
        before(function (done) {
            mockery.registerMock(__dirname + '/config/view', {
                resource : {
                    path : ['public','home'],
                    option : {
                        maxAge: 3600
                    }
                },
                viewExtension : "html",
                pagination: {
                    number_item: 20
                },
                theme: "default",
                nunjuckSettings : {
                }
            });
            application = new ArrowJS;
            application.start().then(function () {
                return done()
            });

        });
        after(function (done) {
            application.close(done);
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("have multi static resource folder", function () {

        });
    });

    //describe("turn on redis", function () {
    //    var application;
    //    before(function (done) {
    //        mockery.registerMock(__dirname + '/config/redis', {
    //            redis: {
    //                host: 'localhost',
    //                port: '6379'
    //            },
    //            redis_prefix: 'arrowjs_',
    //            redis_key : {
    //                configs : "site_setting",
    //                features : "all_features",
    //                backend_menus : "backend_menus",
    //                plugins : "all_plugins"
    //            },
    //            redis_event : {
    //                update_config : "config_update",
    //                update_feature : "feature_update"
    //            }
    //        });
    //        application = new ArrowJS;
    //        application.start().then(function () {
    //            return done()
    //        });
    //
    //    });
    //    after(function (done) {
    //        application.close(done);
    //        fsExtra.removeSync(__dirname + "/log/");
    //        fsExtra.removeSync(__dirname + "/config/");
    //    });
    //    it("turn on redis", function () {
    //
    //    });
    //});

    describe("structure.js no an object", function () {
        var application;
        before(function (done) {
            mockery.registerMock(__dirname + '/config/structure', function () {});
            application = new ArrowJS;
            application.start().then(function () {
                return done()
            });

        });
        after(function (done) {
            application.close(done);
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("structure.js no an object", function () {
            //expect(application).to.throw(Error);
        });
    });

    describe("Can call systemManager functions", function () {
        var application;
        before(function (done) {
            application = new ArrowJS;
            application.start().then(function () {
                return done()
            });

        });
        after(function (done) {
            application.close(done);
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("Can call systemManager functions", function (done) {
            application.featureManager.setCache().then(function () {
                return done()
            })
        });
        it("Can call systemManager functions", function (done) {
            application.featureManager.getCache().then(function () {
                return done()
            })
        });
    });
});
