'use strict';

/**
 * Module dependencies.
 */
let passport = require('passport'),
    url = require('url'),
    FacebookStrategy = require('passport-facebook').Strategy,
    config = require('../config'),
    users = require(__base + 'app/backend/modules/users/controllers/index');

module.exports = function () {
    // Use facebook strategy
    passport.use(new FacebookStrategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.callbackURL,
            passReqToCallback: true
        },
        function (req, accessToken, refreshToken, profile, done) {
            // Set the provider data and include tokens
            let providerData = profile._json;
            providerData.accessToken = accessToken;
            providerData.refreshToken = refreshToken;
            // Create the user OAuth profile
            let providerUserProfile = {
                user_url: providerData.link,
                user_email: providerData.email,
                user_login: providerData.email,
                display_name: providerData.name,
                role_id: 21,
                user_image_url: 'https://graph.facebook.com/' + providerData.id + '/picture?width=200&height=200&access_token=' + providerData.accessToken,
                user_status: 'publish'
            };
            // Save the user OAuth profile
            users.saveOAuthUserProfile(req, providerUserProfile, function(err, user){
                done(err, user);
            });
        }
    ));
};