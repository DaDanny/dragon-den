'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setup = setup;

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportLocal = require('passport-local');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO Remove password required & Allow username login
function localAuthenticate(User, firstName, password, done) {
  console.log('firstName: ', firstName);
  User.findOne({
    firstNameLower: firstName.toLowerCase()
  }).exec().then(function (user) {
    if (!user) {
      return done(null, false, {
        message: 'This name is not registered.'
      });
    }
    user.authenticate(password, function (authError, authenticated) {
      if (authError) {
        return done(authError);
      }
      if (!authenticated) {
        return done(null, false, { message: 'This password is not correct.' });
      } else {
        return done(null, user);
      }
    });
  }).catch(function (err) {
    return done(err);
  });
}

function emailAuthenticate(User, email, password, done) {
  User.findOne({
    email: email.toLowerCase()
  }).exec().then(function (user) {
    if (!user) {
      return done(null, false, {
        message: 'This email is not registered.'
      });
    }
    user.authenticate(password, function (authError, authenticated) {
      if (authError) {
        return done(authError);
      }
      if (!authenticated) {
        return done(null, false, { message: 'This password is not correct.' });
      } else {
        return done(null, user);
      }
    });
  }).catch(function (err) {
    return done(err);
  });
}

function setup(User, config) {
  _passport2.default.use(new _passportLocal.Strategy({
    usernameField: 'firstName',
    passwordField: 'password' // this is the virtual field on the model
  }, function (firstName, password, done) {
    return localAuthenticate(User, firstName, password, done);
  }));

  _passport2.default.use('local-email', new _passportLocal.Strategy({
    usernameField: 'email',
    passwordField: 'password'
  }, function (email, password, done) {
    return emailAuthenticate(User, email, password, done);
  }));
}
//# sourceMappingURL=passport.js.map
