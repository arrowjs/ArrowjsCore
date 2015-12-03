"use strict";

var expect = require("chai").expect;

var actionByAttribute = require("../manager/handleAttribute/handleFunction");

describe("Handle attribute in structure.js", function () {
    it("return null if no attribute name", function () {
        expect(actionByAttribute("test",{_structure : {}})).to.be.null;
    })
})