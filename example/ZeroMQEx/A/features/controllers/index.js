"use strict";

module.exports = function (controller, component, application) {
    controller.index = function (req, res) {
        application.services.B.send({
            action: 'features.index',
            data: {
                username: 'Jordizle',
                password: 'Developer'
            }
        }, function (err,result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result)
            }
        })
    }
};