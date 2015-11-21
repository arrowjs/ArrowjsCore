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
    },
    mailer: {
        from: process.env.MAILER_FROM || 'MAILER_FROM',
        options: {
            service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
            auth: {
                user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
                pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
            }
        }
    }
};