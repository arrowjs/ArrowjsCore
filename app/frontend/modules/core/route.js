'use strict';

let passport = require('passport');

module.exports = function (app) {
    // Passport Router
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'email' ] }));

    app.get('/auth/facebook/callback', function (req, res, next) {
        passport.authenticate("facebook", function (err, user, redirectURL) {
            if (err || !user) {
                return res.redirect('/signin');
            }
            req.login(user, function (err) {
                if (err) {
                    return res.redirect('/signin');
                }
                return res.redirect(redirectURL || '/');
            });
        })(req, res, next);
    });

    app.get('/404.html', function(req, res, next) {
        let env = __.createNewEnv([__base + 'app/frontend/themes', __base + 'app/frontend/themes/' + __config.themes]);
        env.render('404.html', res.locals, function (err, re) {
            res.send(re);
        });
    });
};