'use strict';

module.exports = {
    db: {
        host: 'localhost',
        port: '5432',
        database: 'coretechmaster',
        username: 'postgres',
        password: '',
        dialect: 'postgres',
        logging: false
    },
    redis: {
        host: 'localhost',
        port: '6379'
    },
    assets: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.min.css'
            ]
        }
    },
    facebook: {
        clientID: process.env.FACEBOOK_ID || '290270177727593',
        clientSecret: process.env.FACEBOOK_SECRET || 'd49fccd3d02c70d720f9cc73d3bdf8e7',
        callbackURL: 'http://techmaster.vn/auth/facebook/callback'
    },
    twitter: {
        clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
        clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
        callbackURL: '/auth/twitter/callback'
    },
    google: {
        clientID: process.env.GOOGLE_ID || '107775395827-g1f2ls3j25edhsec8ahrmknoo9a70ofr.apps.googleusercontent.com',
        clientSecret: process.env.GOOGLE_SECRET || 'Xlawr7Rn2Tua3ldPqpPRRfBf',
        callbackURL: 'http://techmaster.vn/auth/google/callback'
    },
    linkedin: {
        clientID: process.env.LINKEDIN_ID || 'APP_ID',
        clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
        callbackURL: '/auth/linkedin/callback'
    },
    github: {
        clientID: process.env.GITHUB_ID || 'APP_ID',
        clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
        callbackURL: '/auth/github/callback'
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
