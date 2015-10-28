'use strict';

module.exports = {
    key: 'site_setting',
    redis_prefix: 'arrowjs_',
    app: {
        language: 'en_US',
        title: 'ArrowJS',
        description: '',
        keywords: '',
        logo: '',
        icon: ''
    },
    admin_prefix: 'admin',
    date_format: 'Y-m-d',
    number_format: {
        thousand: '.',
        decimal: ',',
        length: 2,
        header: '',
        footer: '$'
    },
    mailer_config: {
        service: 'Gmail',
        auth: {
            user: 'test@gmail.com',
            pass: 'secret'
        },
        mailer_from: "Techmaster <test@techmaster.vn>",
        mailer_to: "test@techmaster.vn"
    },
    pagination: {
        number_item: 20
    },
    port: process.env.PORT || 3333,
    templateEngine: 'nunjucks',
    sessionSecret: 'ARROWJS',
    sessionCollection: 'sessions',
    theme: 'default',
    resource : {
        path : 'public',
        option : {
            maxAge: 3600
        }
    },
    bodyParser : {
        extended: true,
        limit: '5mb'
    }
};