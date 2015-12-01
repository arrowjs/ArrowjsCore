"use strict";

var expect = require("chai").expect;
var buildStructure = require("../libs/buildStructure");


describe("Parse structure.js", function () {
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
        expect(buildStructure.bind(null,testCase)).to.throw(Error);
    })
});