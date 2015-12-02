"use strict";
var languageKey = require("arrowjs").language.languageKey;

module.exports = function (controller,component,application) {
    controller.index = function (req,res) {
        var translateTest = __('menu');
        var languageKeyTest = languageKey();

        req.flash.success("success");
        req.flash.error("error");
        req.flash.warn("warn");
        req.flash.info("info");
        res.render('index.twig');
    };

    controller.applicationRender = function (req,res) {
        application.render('./features/demo/view/index.twig');
    };

    controller.logout = function (req,res) {
        req.logout();
        res.redirect('/');
    };
}