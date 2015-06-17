'use strict'
/**
 * Created by thanhnv on 2/23/15.
 */
exports.isAllow = function (route, action, orAction, hasAuthorize) {
    return function (req, res, next) {
        //Check module active
        if (__modules[route] != undefined && (__modules[route].system || __modules[route].active)) {

            //Check acl
            if (req.user != undefined && req.user.acl[route] != undefined) {
                let rules = req.user.acl[route].split(':');
                for (let i in rules) {
                    if (action == rules[i]) {
                        next();
                        return;
                    }
                    if (orAction != null && orAction == rules[i]) {
                        if (hasAuthorize(req, res, next)) {
                            next();
                            return;
                        }

                    }

                }
                req.flash.error("You do not have permission to access");
                res.redirect('/admin/err/404');

            }
            else {
                req.flash.error("You do not have permission to access");
                res.redirect('/admin/err/404');
            }
        }
        else {
            req.flash.error('Module ' + route + ' is not active');
            res.redirect('/admin/err/500');
        }


    }
};

exports.addButton = function (req, route, action, url) {
    if (req.user != undefined && req.user.acl[route] != undefined) {
        let rules = req.user.acl[route].split(':');
        for (let i in rules) {
            if (action == rules[i]) {
                if (url === undefined) {
                    return route.replace('_', '-');
                } else {
                    return url.replace('_', '-');
                }
            }
        }
    }
    return false;
};
exports.customButton = function (url) {
    return url;
};
exports.allow = function (req, route, action) {
    //Check module active
    if (__modules[route] != undefined && (__modules[route].system || __modules[route].active)) {
        if (req.user != undefined && req.user.acl[route] != undefined) {
            let rules = req.user.acl[route].split(':');
            for (let i in rules) {
                if (action == rules[i]) {
                    return true;
                }
            }
            return false;
        }
        else {
            return false;

        }
    }
    else {
        return false;
    }

}