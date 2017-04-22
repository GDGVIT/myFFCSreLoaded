var user = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

passport.serializeUser(function (u, done) {
	done(null, u.id);
});

passport.deserializeUser(function (id, done) {
	user.User.findById(id, function (err, u) {
		done(err, u);
	});
});

passport.use(new LocalStrategy(
	function (username, password, done) {
		user.User.findOne({ regno: username }, function (err, u) {
			if (err) { return done(err); }
			if (!u) {
				return done(null, false, { message: 'Incorrect Register No.' });
			}
			if (u) {
				bcrypt.compare(password, u.passwd, function (err, res) {
					if (res == true) {
						return done(null, u);
					}
					else {
						return done(null, false, { message: 'Incorrect password.' });
					}
				});
			}
		});
	}));