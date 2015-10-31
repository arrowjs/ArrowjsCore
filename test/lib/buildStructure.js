
var chai = require('chai'),
    expect = chai.expect,
    mockery = require('mockery'),
    sinon = require('sinon'),
    build = require('../../libs/buildStructure');

describe("Building application structure", function () {
    before(function () {
        mockery.enable({
            warnOnUnregistered: false,
            warnOnReplace :false
        });
        app = {};
        app.arrFolder  = '';
        app.BaseFolder  = '/a';
    });
    after(function () {
        mockery.disable();
    });
   it(`it a function`, function () {
        expect(build).is.a.function;
   });
   it("get data from file config/structure.js", function () {
       mockery.registerMock(app.arrFolder + "/config/structure", { a : 1});
       expect(build(app)).to.deep.equal({a : 1});
   });
   it("Throw error if file config/structure.js not a function ,Must have keys : manager,module,service", function () {
       mockery.registerMock(app.arrFolder + "/config/structure", function(){});
       expect(build).to.throw(Error);
   })
   it("Use default config/structure.js in node_modules", function () {
       mockery.registerMock(app.arrFolder + "/config/structure", function(){});
       mockery.registerMock(app.baseFolder + "/config/structure", { manager : });
       expect(build(app)).to.deep.equal({a : 2});

   });

});