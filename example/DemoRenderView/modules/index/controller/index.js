'use strict';

module.exports = function (controller,component,application) {
    controller.get = function (req,res) {
        res.render('demo');
    }
};

