"use strict";

var expect = require("chai").expect;
var buildStructure = require("../../libs/buildStructure");
var pathWithConfig = require("../../libs/buildStructure").pathWithConfig;


describe("Parse structure.js", function () {

    context("Level 1", function () {
        it("buildStructure is a function", function () {
            expect(buildStructure).is.a.function;
        });
        it("throw Error if parameter not object", function () {
            let test = 4;
            expect(buildStructure.bind(null,test)).to.throw(Error);
            expect(buildStructure.bind(null,{})).not.to.throw(Error);
        });
        it("Only return object having path attribute", function () {
            let testCase = {
                features : {},
                widgets : {
                    path : {
                        folder: "/demo",
                        file: "a.js"
                    }
                },
                plugins : {
                    path : {
                        folder: "/demo",
                        file: "a.js"
                    }
                }
            };
            expect(buildStructure(testCase)).not.to.have.ownProperty("features");
            expect(buildStructure(testCase)).to.have.ownProperty("plugins");
            expect(buildStructure(testCase)).to.have.ownProperty("widgets");
            expect(buildStructure(testCase)).to.have.deep.property("widgets.type","single");
            expect(buildStructure(testCase).widgets.path["0"].path[0]).to.be.a.function;
        });
        it("Cant set name attribute at lv 1", function () {
            let testCase = {
                widgets : {
                    path : {
                        folder: "/demo",
                        file: "a.js",
                        name : "demo"
                    }
                }
            };
            expect(buildStructure(testCase).widgets.type).to.be.equal("single");
        });
    });
    context("level 2" , function () {

        it("only return attribute have path info", function () {
            let testCase = {
                widgets : {
                    path : {
                        folder: "/demo",
                        file: "a.js"
                    },
                    controller: {
                        path : {
                            folder : "/demo",
                            file : "f.js"
                        }
                    },
                    view : {
                        path : {
                        }
                    },
                    model : {
                    }
                }
            };
            expect(buildStructure(testCase).widgets.path["0"]).to.have.ownProperty("controller");
            expect(buildStructure(testCase).widgets.path["0"]).not.to.have.ownProperty("view");
            expect(buildStructure(testCase).widgets.path["0"]).not.to.have.ownProperty("model");
        });

        it("Can set name attribute", function () {
            let testCase = {
                widgets : {
                    path : {
                        folder: "/demo",
                        file: "a.js"
                    },
                    controller: {
                        path : {
                            folder : "/demo",
                            file : "f.js",
                            name : "frontend"
                        }
                    }
                }
            };
            expect(buildStructure(testCase).widgets.path[0]).to.have.deep.property("controller.type","multi");
        });

        it("Can extend a feature", function () {
            let testCase = {
                widgets : {
                    path : {
                        folder: "/demo",
                        file: "a.js"
                    },
                    extend : {
                        demo : true
                    }
                }
            };
            expect(buildStructure(testCase).widgets.path[0].extend).to.have.ownProperty("demo");

        });

        it("Can set prefix,authenticate attributes", function () {
            let testCase = {
                widgets : {
                    path : {
                        folder: "/demo",
                        file: "a.js"
                    },
                    route: {
                        path : {
                            folder : "/demo",
                            file : "f.js",
                            prefix : "/admin",
                            authenticate : true
                        }
                    }
                }
            };
            expect(buildStructure(testCase).widgets.path[0].route.path[0]).to.have.ownProperty("prefix");
            expect(buildStructure(testCase).widgets.path[0].route.path[0]).to.have.ownProperty("authenticate");
        });

        it("Only load extend,controller,view,action,model,route ", function () {
            let testCase = {
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
                            "folder": "models",
                            "file": "*.js"
                        }
                    },
                    "action": {
                        "path": {
                            "folder": "action",
                            "file": "*.js"
                        }
                    },
                    "view": {
                        "path": {
                            "folder": "view"
                        }
                    },
                    "controller": {
                        "path": {
                            "folder": "controller",
                            "file": "*.js"
                        }
                    },
                    "route": {
                        "path": {
                            "file": "route.js"
                        }
                    },
                    "demo" : {
                        "path": {
                            "folder": "controller",
                            "file": "*.js"
                        }
                    },
                    "func" : function () {
                        return null
                    }
                }
            };

            expect(buildStructure(testCase).features.path[0]).to.have.ownProperty("model");
            expect(buildStructure(testCase).features.path[0]).to.have.ownProperty("view");
            expect(buildStructure(testCase).features.path[0]).to.have.ownProperty("controller");
            expect(buildStructure(testCase).features.path[0]).to.have.ownProperty("action");
            expect(buildStructure(testCase).features.path[0]).to.have.ownProperty("extend");
            expect(buildStructure(testCase).features.path[0]).to.have.ownProperty("route");
            expect(buildStructure(testCase).features.path[0]).not.to.have.ownProperty("demo");
            expect(buildStructure(testCase).features.path[0]).not.to.have.ownProperty("func");

        })
    })
});

describe("Make glob path", function () {
    var config = {
        test : "hello"
    };
    it("return function", function () {
        expect(pathWithConfig).to.be.a.function;
    });
    it("concat folder and file", function () {
        let folder = "/admin/";
        let file = "*.js";
        let makeGlob = pathWithConfig(folder,file);
        expect(makeGlob(config)).to.be.equal("/admin/*.js")
    });
    it("replace ':configKey' with config", function () {
        let folder = "/admin/:test/";
        let file = "*.js";
        let makeGlob = pathWithConfig(folder,file);
        expect(makeGlob(config)).to.be.equal("/admin/hello/*.js")
    });
    it("replace '$component' with component name", function () {
        let folder = "/admin/:test/$component/";
        let file = "*.js";
        let makeGlob = pathWithConfig(folder,file);
        expect(makeGlob(config,"user")).to.be.equal("/admin/hello/user/*.js")
    });
    it("return null if cant find config", function () {
        let folder = "/admin/:test/:demo/";
        let file = "*.js";
        let makeGlob = pathWithConfig(folder,file);
        expect(makeGlob(config,"user")).to.be.equal("/admin/hello/*.js")
    });
    it("return null if cant find component name", function () {
        let folder = "/admin/$component/";
        let file = "*.js";
        let makeGlob = pathWithConfig(folder,file);
        expect(makeGlob(config)).to.be.equal("/admin/*.js")
    });
});