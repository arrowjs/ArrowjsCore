'use strict';

module.exports = function (controller,component,application) {
    controller.remoteCall = function (req,res) {
        res.render('remote');
    };
};