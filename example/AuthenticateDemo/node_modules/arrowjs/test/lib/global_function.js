/*
"use strict";

var chai = require('chai'),
    expect = chai.expect,
    mockery = require('mockery'),
    sinon = require('sinon'),
    __ = require("../../libs/global_function");

describe("Global function", function () {
    context("Load config from file", function () {
        before(function () {
            global.__base = __dirname + '/';
            mockery.enable({
                warnOnUnregistered: false
            });
        });

        it("it must get data from config.js, default.js, 'env'.js", function () {
            mockery.registerMock(__base + 'config/config', {});
            mockery.registerMock(__base + 'config/env/default', {});
            mockery.registerMock(__base + 'config/env/development', {});

            expect(__.getRawConfig()).to.be.an('object');
        });
        after(function () {
            mockery.disable();
        });
        it("throw errow when data not object");
        it("warning when process.ENV = default");
        it("it make development file if no env setting",function(){

        });
    });
    context("Load structure system", function () {

    });
});*/
