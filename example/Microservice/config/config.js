'use strict';

module.exports = {
    port: process.env.PORT || 8000,
    key: 'site_setting',
    redis_prefix: 'arrowjs_',
    app: {
        language: 'en_US',
        title: 'ArrowJS',
        description: 'Hello World',
        keywords: 'Simple demo',
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
    templateEngine: 'nunjucks',
    sessionSecret: 'ARROWJS',
    sessionCollection: 'sessions',
    bodyParser : {
        extended: true,
        limit: '5mb'
    }
};