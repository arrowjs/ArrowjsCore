/**
 * Created by thanhnv on 4/18/15.
 */
"use strict";
let __pluginManager = require('./plugins_manager');

let google = require('googleapis');
let CLIENT_ID = '1088344376413-220618hg1c06d8p3bitjsbt2k74g1l68.apps.googleusercontent.com';
let CLIENT_SECRET = 'cBnnCAb2oaQc4WlxQh8Og7oj';
let oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'postmessage');
let analytics = google.analytics('v3');
let SERVICE_ACCOUNT_EMAIL = '1088344376413-220618hg1c06d8p3bitjsbt2k74g1l68@developer.gserviceaccount.com';
let SERVICE_ACCOUNT_KEY_FILE = __base + 'config/env/techmaster_key.pem';
let jwt = new google.auth.JWT(
    SERVICE_ACCOUNT_EMAIL,
    SERVICE_ACCOUNT_KEY_FILE,
    null,
    ['https://www.googleapis.com/auth/analytics.readonly']);
let access_token = '';
let expiry_date = 0;

function GA() {
    let self = this;

    this.init = function() {
        __pluginManager.loadAllPlugins();
        let ggPlg = __pluginManager.getPlugin('google');
        if(ggPlg) {
            ggPlg = ggPlg.options;
            if( ggPlg.clientID && ggPlg.clientID != '' &&
                ggPlg.clientSecret && ggPlg.clientSecret != '' &&
                ggPlg.serviceAEmail && ggPlg.serviceAEmail != '' &&
                ggPlg.serviceAKeyFile && ggPlg.serviceAKeyFile != ''
            ) {
                CLIENT_ID = ggPlg.clientID;
                CLIENT_SECRET = ggPlg.clientSecret;
                SERVICE_ACCOUNT_EMAIL = ggPlg.serviceAEmail;
                SERVICE_ACCOUNT_KEY_FILE = ggPlg.serviceAKeyFile;
                jwt = new google.auth.JWT(
                    SERVICE_ACCOUNT_EMAIL,
                    SERVICE_ACCOUNT_KEY_FILE,
                    null,
                    ['https://www.googleapis.com/auth/analytics.readonly']);
            }
        }
    };

    this.getGoogleInformation = function (cb) {
        self.init();

        jwt.authorize(function (err, result) {
            if(err) setTimeout(cb(null), 0);
            else {
                access_token = result.access_token;
                expiry_date = result.expiry_date;
                oauth2.setCredentials({
                    access_token: result.access_token
                });
                analytics.data.ga.get({
                    auth: oauth2,
                    "ids": "ga:59684062",
                    "start-date": '7daysAgo',
                    "end-date": 'yesterday',
                    "metrics": "ga:visits",
                    "dimensions": 'ga:day,ga:month,ga:year'
                }, function (err, body) {
                    if (err) {
                        setTimeout(cb(null), 0);
                    } else {
                        var data = [];
                        if (body != null) {
                            body.rows.sort(function (a, b) {
                                if ((a[2] - b[2]) == 0) {
                                    return a[1] - b[1];
                                }
                                else {
                                    return a[2] - b[2];
                                }

                            });
                            for (var i in body.rows) {
                                var day = parseInt(body.rows[i][0]);
                                var month = parseInt(body.rows[i][1]);
                                var year = parseInt(body.rows[i][2]);
                                var value = parseInt(body.rows[i][3]);
                                var vl = [day + '/' + month + '/' + year, value];
                                data.push(vl);
                            }
                        }

                        setTimeout(cb(data), 0);
                    }
                });
            }
        });

    };
    this.getGooglePopularLinkInformation = function (mark_link, cb) {
        self.init();

        jwt.authorize(function (err, result) {
            if(err) setTimeout(cb(null), 0);
            else {
                access_token = result.access_token;
                expiry_date = result.expiry_date;
                oauth2.setCredentials({
                    access_token: result.access_token
                });
                analytics.data.ga.get({
                    auth: oauth2,
                    "ids": "ga:59684062",
                    "start-date": '7daysAgo',
                    "end-date": 'yesterday',
                    "metrics": "ga:pageviews",
                    "dimensions": 'ga:pagePath',
                    "sort": '-ga:pageviews',
                    "max-results": '10',
                    "filters": 'ga:pagePath=~^\/' + mark_link + '/'
                }, function (err, body) {
                    if (err) {
                        setTimeout(cb(null), 0);
                    }
                    else {
                        setTimeout(cb(body), 0);
                    }

                });
            }
        });
    };
}
module.exports = GA;