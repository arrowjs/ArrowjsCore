'use strict';

module.exports = function (controller,component,application) {
  controller.showAll = function (req,res) {
    res.send('ok')
  };
};