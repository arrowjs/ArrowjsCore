'use strict';

module.exports = function (controller,component,application) {
    controller.index = function (req,res) {
        res.send("Welcome to Arrowjs.io<br><a href='\about'>About us</a>");
    };

    controller.about = function (req,res) {
        res.send("Written by TechMaster and you");
    };
};