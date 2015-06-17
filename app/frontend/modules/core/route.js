'use strict';
/**
 * Created by thanhnv on 1/28/15.
 */
let passport = require('passport');
let config = require(__base + 'config/config.js');
let core = require('./controllers/index');

module.exports = function (app) {
    app.get('/test', function (req, res) {
        let start = new Date().getTime();
        //__models.sequelize.query('BEGIN;select get_detail_course(:courseId,\'course\',\'sections\',\'lessons\');FETCH ALL IN "course";FETCH ALL IN "sections";FETCH ALL IN "lessons";COMMIT;',
        //__models.sequelize.query('select get_detail_course(:courseId)',
//        __models.sequelize.query('select json_agg(c.*) as course from ( SELECT id, lecture, title from course where id = :courseId ) as c; select json_agg(sections.*) as sections from sections where course_id=:courseId;',
//        __models.sequelize.query('select json_agg(c.*) as course from ( SELECT id, lecture, title from course where id = :courseId ) as c; select json_agg(sections.*) as sections from sections where course_id=:courseId;',
        __models.sequelize.query("BEGIN;select get_detail_lesson(:lessonId,'lesson','media');FETCH ALL IN \"lesson\";FETCH ALL IN \"media\";COMMIT;",
            {replacements: {lessonId: 212}}
        )
            .then(function (result) {
                //console.log('END : ', new Date().getTime() - start);
                res.send((new Date().getTime() - start)+"");
            });
    });
    app.get('/customer-register/:cid/render-bill', core.renderBill);
    app.route('/user/notify').get(core.notify);
    app.route('/user/signup').get(core.checkLogin, core.signupPage);
    app.route('/user/signup').post(core.signup);
    app.route("/user/signin").get(core.checkLogin, core.index);
    app.route('/user/my-course').get(core.course);
    app.route('/user/signin').post(core.signin);
    app.route('/user/signout').get(core.signout);
    app.route('/user/dashboard').get(core.dashboard);
    app.route('/user/my-profile').get(core.userProfile);
    app.route('/user/my-profile').post(core.updateUser, core.userProfile);
    app.route('/user/change-pass').post(core.updatePass);
    app.route('/user/forgot-pass').get(core.forgotPage);
    app.route('/user/forgot-pass').post(core.forgotPass);
    app.route('/user/reset/:userid/:token').get(core.getReset);
    app.route('/user/reset/:userid/:token').post(core.postReset);
    app.route('/user/activate/:userid/:activate').get(core.activateAccount);

    app.route('/avatar').post(core.getAvatarGallery);

    // Passport Router
    //Facebook
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));
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

    //GOOGLE
    app.get('/auth/google', passport.authenticate('google', {scope: ['email']}));
    app.get('/auth/google/callback', function (req, res, next) {
        passport.authenticate("google", function (err, user, redirectURL) {
            if (err || !user) {
                return res.redirect('/signin');
            }
            req.login(user, function (err) {
                if (err) {
                    return res.redirect('signin');
                }
                return res.redirect(redirectURL || '/');
            });
        })(req, res, next);
    });

    app.get('/404.html', function (req, res, next) {
        let env = __.createNewEnv([__base + 'app/frontend/themes', __base + 'app/frontend/themes/' + config.themes]);
        env.render('404.html', res.locals, function (err, re) {
            res.send(re);
        });
    });

};