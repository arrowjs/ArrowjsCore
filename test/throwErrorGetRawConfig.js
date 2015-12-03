//"use strict";
//
//var expect = require("chai").expect;
//var mockery = require("mockery");
//var fsExtra = require("fs-extra");
//
//
//var __ = require("../libs/global_function");
//
//describe("Throw error if cant loading config file", function () {
//    before(function () {
//        mockery.enable({
//            warnOnReplace: false,
//            warnOnUnregistered: false
//        });
//        mockery.registerMock("fs",{
//            accessSync : function () {
//                throw new Error("not ENOENT error");
//            }
//        })
//    });
//
//    after(function () {
//        mockery.disable();
//        fsExtra.removeSync(__dirname + "/log/");
//        fsExtra.removeSync(__dirname + "/config/");
//    });
//    it("throw error if not ENOENT error", function () {
//        expect(__.getRawConfig).to.throw(Error("not ENOENT error"));
//    })
//});