'use strict';

module.exports = function (req, res, next) {
    // Check if is using admin view
    let pre_fix = '';
    let module = res.locals.route.split('/')[1];
    if (module == __config.admin_prefix) {
        pre_fix = module = res.locals.route.split('/')[2];
    }

    if (module == '') {
        module = 'dashboard';
    }
    module = module.split('?')[0];

    let moduleName = module.replace('-', '_');
    if (moduleName == 'login' || moduleName == 'uploads' || moduleName == 'err') return next();
    if (!req.isAuthenticated()) {
        return res.redirect('/' + __config.admin_prefix + '/login');
    }
    if (__modules[moduleName] != undefined && (__modules[moduleName].system || __modules[moduleName].active)) {
        next();
    } else {
        console.log(moduleName + ' is not active or not have permission');
        req.flash.error('Module ' + module + ' is not active: ' + res.locals.route);
        res.redirect('/admin/err/500');
    }
};
