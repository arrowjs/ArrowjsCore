'use strict';

module.exports = function (controller,component,application) {

    controller.loginView = function (req,res) {
        res.render('login');
    };

    controller.createView = function (req,res) {
        res.render('create');
    };

    controller.create = function (req,res) {
        var username = req.body.username;
        var password = req.body.password;
        component.models.user.find({
            where : {
                username : username
            }
        }).then(function (result) {
            if (result) return res.send('Username already exists');
            component.models.user.create({
                username: username,
                password: password
            }).then(function (a) {
                req.flash.success('Register successfully');
                res.redirect('/');
            }).catch(function (err) {
                console.log(err);
            })
        })
    };

    controller.index = function (req,res) {
        res.render('index');
    }

};

