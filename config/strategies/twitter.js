'use strict';

/**
 * Module dependencies.
 */
let passport = require('passport'),
	url = require('url'),
	TwitterStrategy = require('passport-twitter').Strategy,
	config = require('../config'),
    users = require(__base + 'app/backend/modules/users/controllers/index');

module.exports = function() {
	// Use twitter strategy
	passport.use(new TwitterStrategy({
			consumerKey: config.twitter.clientID,
			consumerSecret: config.twitter.clientSecret,
			callbackURL: config.twitter.callbackURL,
			passReqToCallback: true
		},
		function(req, token, tokenSecret, profile, done) {
			// Set the provider data and include tokens
			let providerData = profile._json;
			providerData.token = token;
			providerData.tokenSecret = tokenSecret;

			// Create the user OAuth profile
			let providerUserProfile = {
				displayName: profile.displayName,
				username: profile.username,
				provider: 'twitter',
				providerIdentifierField: 'id_str',
				providerData: providerData
			};

			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, done);
		}
	));
};