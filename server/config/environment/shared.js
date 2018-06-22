'use strict';

var findup = require('findup-sync');
var pJson = require(findup('package.json'));

exports = module.exports = {
  // List of user roles
  userRoles: ['guest', 'user', 'employee', 'admin', 'super-admin'],
  appVersion: pJson.version,
  env: process.env.NODE_ENV
};
//# sourceMappingURL=shared.js.map
