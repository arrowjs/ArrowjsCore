'use strict';
let fs = require('fs');
let passport = require("passport");

module.exports = function loadPassport() {
    let app = this;
    try {
        fs.accessSync(app.arrFolder + 'config/passport.js');
        __.getGlobbedFiles(app.arrFolder + 'config/strategies/**/*.js').forEach(function (strategy) {
            require(path.resolve(strategy))();
        });
        require(app.arrFolder + 'config/passport.js')(passport);

        app.use(passport.initialize());
        app.use(passport.session());
    } catch(err){
        return null;
    }
    return null;
};
