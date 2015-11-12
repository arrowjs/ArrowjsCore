'use strict';

module.exports = function (controller,component,application) {
    controller.index = function (req, res) {
        res.render('index');
    };
    controller.about = function (req,res) {
        res.render('about');
    };
    controller.post = function (req,res) {
        res.render('post');
    };
    controller.role = function (req,res) {
        res.render('role');
    };
    controller.rolePost = function (req,res) {
        req.session.permissions = {
            features : {
                index :  [{
                    name : "index"
                },{
                    name : "about"
                },{
                    name : "post"
                }]
            }
        }
        req.flash.success("Change role successfully");
        res.render('role');
    };
};

