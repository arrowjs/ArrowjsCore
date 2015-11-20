"use strict";

/**
 * Support node_mailer;
 * @type {{mailer_config: {service: string, auth: {user: string, pass: string}, mailer_from: string, mailer_to: string}}}
 */
module.exports = {
    mailer_config: {
        service: 'Gmail',
        auth: {
            user: 'test@gmail.com',
            pass: 'secret'
        },
        mailer_from: "Techmaster <test@techmaster.vn>",
        mailer_to: "test@techmaster.vn"
    }
};