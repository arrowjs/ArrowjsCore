/**
 * Created by thanhnv on 2/13/15.
 */
var SphinxClient = require ("sphinxapi"),
    util = require('util'),
    assert = require('assert');
var cl = new SphinxClient();
cl.SetServer('localhost', 9312);

module.exports = cl;
