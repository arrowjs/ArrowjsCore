var expect = require("chai").expect;
var mockery = require("mockery");
var fsExtra = require("fs-extra");
var winston = require("winston");

var ArrowJS = require("../libs/ArrowApplication");


describe("Throw error if wrong data export type (controller,route,action) ", function () {
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
        mockery.disable();
    });

    context("Single Route", function () {
        before(function () {
            mockery.registerMock(__dirname + '/config/structure', {
                features: {
                    "path": {
                        "folder": "/features",
                        "file": "feature.js"
                    },
                    "route": {
                        "path": {
                            "file": "wrongRoute.js"
                        }
                    }
                }
            });
        });
        after(function () {
            mockery.deregisterMock(__dirname + '/config/structure');
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("module.export not a function" , function () {
            function throwsError() {
                new ArrowJS
            }
            expect(throwsError).to.throw(Error);
        })
    });

    context("Single Route", function () {
        before(function () {
            mockery.registerMock(__dirname + '/config/structure', {
                features: {
                    "path": {
                        "folder": "/features",
                        "file": "feature.js"
                    },
                    "route": {
                        "path": {
                            "file": "wrongRoute2.js"
                        }
                    }
                }
            });
        });
        after(function () {
            mockery.deregisterMock(__dirname + '/config/structure');
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("function not return object" , function () {
            function throwsError() {
                new ArrowJS
            }
            expect(throwsError).to.throw(Error);
        })
    });

    context("Multi Route", function () {
        before(function () {
            mockery.registerMock(__dirname + '/config/structure', {
                features: {
                    "path": {
                        "folder": "/features",
                        "file": "feature.js"
                    },
                    "route": [{
                        "path": {
                            "folder" : "route",
                            "file": "wrongRoute.js",
                            "name" : "frontend"
                        }
                    }]
                }
            });
        });
        after(function () {
            mockery.deregisterMock(__dirname + '/config/structure');
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("module.export not a function" , function () {
            function throwsError() {
                new ArrowJS
            }
            expect(throwsError).to.throw(Error);
        })
    });

    context("Multi Route", function () {
        before(function () {
            mockery.registerMock(__dirname + '/config/structure', {
                features: {
                    "path": {
                        "folder": "/features",
                        "file": "feature.js"
                    },
                    "route": [{
                        "path": {
                            "folder" : "route",
                            "file": "wrongRoute2.js",
                            "name" : "frontend"
                        }
                    }]
                }
            });
        });
        after(function () {
            mockery.deregisterMock(__dirname + '/config/structure');
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("function not return object" , function () {
            function throwsError() {
                new ArrowJS
            }
            expect(throwsError).to.throw(Error);
        })
    });

    context("Single Controller", function () {
        before(function () {
            mockery.registerMock(__dirname + '/config/structure', {
                features: {
                    "path": {
                        "folder": "/features",
                        "file": "feature.js"
                    },
                    "controller": {
                        "path": {
                            "folder" : "controller",
                            "file": "wrongController.js"
                        }
                    }
                }
            });
        });
        after(function () {
            mockery.deregisterMock(__dirname + '/config/structure');
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("module.export not a function" , function () {
            function throwsError() {
                new ArrowJS
            }
            expect(throwsError).to.throw(Error);
        })
    });

    context("Single Controller", function () {
        before(function () {
            mockery.registerMock(__dirname + '/config/structure', {
                features: {
                    "path": {
                        "folder": "/features",
                        "file": "feature.js"
                    },
                    "controller": {
                        "path": {
                            "folder" : "controller",
                            "file": "wrongController2.js"
                        }
                    }
                }
            });
        });
        after(function () {
            mockery.deregisterMock(__dirname + '/config/structure');
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("function return a Error" , function () {
            function throwsError() {
                new ArrowJS
            }
            expect(throwsError).to.throw(Error);
        })
    });

    context("Multi Controller", function () {
        before(function () {
            mockery.registerMock(__dirname + '/config/structure', {
                features: {
                    "path": {
                        "folder": "/features",
                        "file": "feature.js"
                    },
                    "controller": [{
                        "path": {
                            "folder" : "controller",
                            "file": "wrongController.js",
                            "name" : "frontend"
                        }
                    }]
                }
            });
        });
        after(function () {
            mockery.deregisterMock(__dirname + '/config/structure');
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("module.export not a function" , function () {
            function throwsError() {
                new ArrowJS
            }
            expect(throwsError).to.throw(Error);
        })
    });

    context("Multi Controller", function () {
        before(function () {
            mockery.registerMock(__dirname + '/config/structure', {
                features: {
                    "path": {
                        "folder": "/features",
                        "file": "feature.js"
                    },
                    "controller": [{
                        "path": {
                            "folder" : "controller",
                            "file": "wrongController2.js",
                            "name" : "frontend"
                        }
                    }]
                }
            });
        });
        after(function () {
            mockery.deregisterMock(__dirname + '/config/structure');
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("function not return object" , function () {
            function throwsError() {
                new ArrowJS
            }
            expect(throwsError).to.throw(Error);
        })
    });

    context("Single Action", function () {
        before(function () {
            mockery.registerMock(__dirname + '/config/structure', {
                features: {
                    "path": {
                        "folder": "/features",
                        "file": "feature.js"
                    },
                    "action": {
                        "path": {
                            "folder" : "action",
                            "file": "wrongAction.js"
                        }
                    }
                }
            });
        });
        after(function () {
            mockery.deregisterMock(__dirname + '/config/structure');
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("module.export not a function" , function () {
            function throwsError() {
                new ArrowJS
            }
            expect(throwsError).to.throw(Error);
        })
    });

    context("Single Action", function () {
        before(function () {
            mockery.registerMock(__dirname + '/config/structure', {
                features: {
                    "path": {
                        "folder": "/features",
                        "file": "feature.js"
                    },
                    "action": {
                        "path": {
                            "folder" : "action",
                            "file": "wrongAction2.js"
                        }
                    }
                }
            });
        });
        after(function () {
            mockery.deregisterMock(__dirname + '/config/structure');
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("function return a Error" , function () {
            function throwsError() {
                new ArrowJS
            }
            expect(throwsError).to.throw(Error);
        })
    });

    context("Multi Action", function () {
        before(function () {
            mockery.registerMock(__dirname + '/config/structure', {
                features: {
                    "path": {
                        "folder": "/features",
                        "file": "feature.js"
                    },
                    "action": [{
                        "path": {
                            "folder" : "action",
                            "file": "wrongAction.js",
                            "name" : "frontend"
                        }
                    }]
                }
            });
        });
        after(function () {
            mockery.deregisterMock(__dirname + '/config/structure');
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("module.export not a function" , function () {
            function throwsError() {
                new ArrowJS
            }
            expect(throwsError).to.throw(Error);
        })
    });

    context("Multi Action", function () {
        before(function () {
            mockery.registerMock(__dirname + '/config/structure', {
                features: {
                    "path": {
                        "folder": "/features",
                        "file": "feature.js"
                    },
                    "action": [{
                        "path": {
                            "folder" : "action",
                            "file": "wrongAction2.js",
                            "name" : "frontend"
                        }
                    }]
                }
            });
        });
        after(function () {
            mockery.deregisterMock(__dirname + '/config/structure');
            fsExtra.removeSync(__dirname + "/log/");
            fsExtra.removeSync(__dirname + "/config/");
        });
        it("function not return object" , function () {
            function throwsError() {
                new ArrowJS
            }
            expect(throwsError).to.throw(Error);
        })
    });
});
