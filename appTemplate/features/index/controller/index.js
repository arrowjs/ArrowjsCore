'use strict';

module.exports = function (controller, feature, application) {
    controller.index = function (req,res) {
        res.render('index')
    };
};