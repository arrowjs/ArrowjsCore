'use strict';

/**
 * Module dependencies.
 */
let passport = require('passport'),
	url = require('url'),
	LinkedInStrategy = require('passport-linkedin').Strategy,
	config = require('../config'),
    users = require(__base + 'app/backend/modules/users/controllers/index');

module.exports = function() {
	// Use linkedin strategy
	passport.use(new LinkedInStrategy({
			consumerKey: config.linkedin.clientID,
			consumerSecret: config.linkedin.clientSecret,
			callbackURL: config.linkedin.callbackURL,
			passReqToCallback: true,
			profileFields: ['id', 'first-name', 'last-name', 'email-address']
		},
		function(req, accessToken, refreshToken, profile, done) {
			// Set the provider data and include tokens
			let providerData = profile._json;
			providerData.accessToken = accessToken;
			providerData.refreshToken = refreshToken;

			// Create the user OAuth profile
			let providerUserProfile = {
				firstName: profile.name.givenName,
				lastName: profile.name.familyName,
				displayName: profile.displayName,
				email: profile.emails[0].value,
				username: profile.username,
				provider: 'linkedin',
				providerIdentifierField: 'id',
				providerData: providerData
			};

			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, done);
		}
	));
};