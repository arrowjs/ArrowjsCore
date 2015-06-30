'use strict';

/**
 * Module dependencies.
 */
let passport = require('passport'),
	url = require('url'),
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
	users = require(__base + 'core/modules/users/backend/controllers/index');


module.exports = function() {
	// Use google strategy
	passport.use(new GoogleStrategy({
			clientID: __config.google.clientID,
			clientSecret: __config.google.clientSecret,
			callbackURL: __config.google.callbackURL,
			passReqToCallback: true
		},
		function(req, accessToken, refreshToken, profile, done) {
			// Set the provider data and include tokens
			let providerData = profile._json;
			providerData.accessToken = accessToken;
			providerData.refreshToken = refreshToken;
			// Create the user OAuth profile
			let providerUserProfile = {
				user_url: providerData.link,
				display_name: profile.displayName,
				user_email: profile.emails[0].value,
				user_login: profile.emails[0].value,
				role_id: 21,
				user_status: 'publish',
				provider: 'google',
				providerIdentifierField: 'id',
				providerData: providerData
			};

			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, function(err, user){
				done(err, user);
			});
		}
	));
};