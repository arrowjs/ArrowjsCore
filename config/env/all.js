'use strict';

module.exports = {
    key:'site_setting',
    redis_prefix: 'arrowjs_',
    app: {
        title: 'Techmaster Việt Nam',
        description: 'Đào tạo công nghệ thông tin | Thiết kế web | Xây dựng ứng dụng di động',
        keywords: 'Techmaster, học lập trình, thiết kế web, học iOS',
        logo:'',
        icon:''
    },
    admin_prefix: 'admin',
    date_format: 'Y-m-d', //'d/m/Y'
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
            user: '66203170ded0024029ebd6be09d93e33ee8ca830c2',
            pass: '743c2a69d5cd44306cbb98'
        },
        mailer_from: "Techmaster <support@techmaster.vn>",
        mailer_to: "cuong@techmaster.vn"
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