'use strict';

module.exports = {
    key:'site_setting',
    redis_prefix: 'tech_tm_',
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
            user: 'support@techmaster.vn',
            pass: 'aikido2015-'
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
    themes: 'tech',
    assets: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.css'
            ]

        }
    },
    'const': {
        class_user_status: {
            DUP : 0,
            DANG_HOC: 1,
            BO_HOC: 2
        }
    }
};