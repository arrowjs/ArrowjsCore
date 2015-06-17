'use strict'
/**
 * Created by thanhnv on 2/23/15.
 */
let config = require(__base + 'config/config.js');
module.exports = function (req, res, next) {
    let module = res.locals.route.split('/')[1];
    let moduleName = module.replace('-', '_');
    if (__f_modules[moduleName] == undefined) next();
    else if (__f_modules[moduleName].system || __f_modules[moduleName].active) {
        next();
    }
    else {
        req.flash.error('Module ' + module + ' is not active');
        res.render('500');
    }
}
