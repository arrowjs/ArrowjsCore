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
        mailer_from: "Techmaster <support@techmaster.vn>",
        mailer_to: "admin@techmaster.vn"
    },
    pagination: {
        number_item: 20
    },
    port: process.env.PORT || 3333,
    templateEngine: 'nunjucks',
    sessionSecret: 'GREEN',
    sessionCollection: 'sessions',
    theme: 'default',
    assets: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.css'
            ]
        }
    }
};