'use strict';

/**
 * Module dependencies.
 */
let passport = require('passport'),
	url = require('url'),
	GithubStrategy = require('passport-github').Strategy,
	users = require(__base + 'core/modules/users/backend/controllers/index');


module.exports = function() {
	// Use github strategy
	passport.use(new GithubStrategy({
			clientID: __config.github.clientID,
			clientSecret: __config.github.clientSecret,
			callbackURL: __config.github.callbackURL,
			passReqToCallback: true
		},
		function(req, accessToken, refreshToken, profile, done) {
			// Set the provider data and include tokens
			let providerData = profile._json;
			providerData.accessToken = accessToken;
			providerData.refreshToken = refreshToken;

			// Create the user OAuth profile
			let providerUserProfile = {
				displayName: profile.displayName,
				email: profile.emails[0].value,
				username: profile.username,
				provider: 'github',
				providerIdentifierField: 'id',
				providerData: providerData
			};

			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, done);
		}
	));
};