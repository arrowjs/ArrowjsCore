"use strict";

module.exports = function (controller, component, application) {
    controller.index = function (req, res) {
        application.services.B.send({
            action: 'features.index',
            demo: {
                username: 'Jordizle',
                password: 'Developer'
            }
        }, function (err,result) {
            console.log(err);
            if (err) {
                res.send(err);
            } else {
                res.send(result)
            }
        })
    }
};