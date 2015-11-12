'use strict';

module.exports = function (controller,component,application) {
    /**
     * Render index view with links to other views
     */
    controller.index = function (req,res) {
        res.render('index')
    };

    controller.about = function (req,res) {
        res.render('about')
    };

    controller.post = function (req,res) {
        res.render('post')
    };

    controller.contact = function (req,res) {
        res.render('contact')
    };

    controller.changeTheme = function (req,res) {
        let theme = req.query.theme || "clean";
        application.setConfig("theme",theme).then(function () {
            res.render('change', {theme: application.getConfig('theme')});
        });
    }
};