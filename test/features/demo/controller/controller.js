"use strict";
var languageKey = require("arrowjs").language.languageKey;

module.exports = function (controller,component,application) {
    controller.index = function (req,res) {
        var translateTest = __('menu');
        var translateNoKey = __('dontHave');
        var languageKeyTest = languageKey();

        //setSession

        req.session.permissions = {};

        req.flash.success("success");
        req.flash.error("error");
        req.flash.warn("warn");
        req.flash.info("info");
        res.render('index.twig');
    };

    controller.applicationRender = function (req,res) {
        application.render('./features/demo/view/index.twig', function (err,html) {
            res.send(html);
        });
    };

    controller.linkto = function (req,res) {
        res.render("linkto.twig");
    };

    controller.enableWebsocketCluster = function (req,res) {
        application.render("./features/demo/view/enableWebsocketCluster.twig", function (err,html) {
            res.sendStatus(200);
        });
    };

    controller.logout = function (req,res) {
        req.logout();
        res.redirect('/');
    };
}