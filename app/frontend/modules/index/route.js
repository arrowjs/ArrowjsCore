/**
 * Created by thanhnv on 2/17/15.
 */
'use strict';

module.exports = function(app) {
    // Root routing
    let core = require('./controllers/index');
    app.route('/').get(core.index);

};