/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var _thingModel = require('../models/thing.model.js');

var _thingModel2 = _interopRequireDefault(_thingModel);

var _userModel = require('../models/user.model.js');

var _userModel2 = _interopRequireDefault(_userModel);

var _base = require('../models/base.model');

var _base2 = _interopRequireDefault(_base);

var _site = require('../models/site.model');

var _site2 = _interopRequireDefault(_site);

var _room = require('../models/room.model');

var _room2 = _interopRequireDefault(_room);

var _task = require('../models/task.model');

var _task2 = _interopRequireDefault(_task);

var _userTask = require('../models/userTask.model');

var _userTask2 = _interopRequireDefault(_userTask);

var _masterTimelineTask = require('../models/masterTimelineTask.model');

var _masterTimelineTask2 = _interopRequireDefault(_masterTimelineTask);

var _timeline = require('../models/timeline.model');

var _timeline2 = _interopRequireDefault(_timeline);

var _roomTimeline = require('../models/roomTimeline.model');

var _roomTimeline2 = _interopRequireDefault(_roomTimeline);

var _media = require('../models/media.model');

var _media2 = _interopRequireDefault(_media);

var _deletedTLTask = require('../models/deletedTLTask.model');

var _deletedTLTask2 = _interopRequireDefault(_deletedTLTask);

var _timelineTask = require('../models/timelineTask.model');

var _timelineTask2 = _interopRequireDefault(_timelineTask);

var _memo = require('../models/memo.model');

var _memo2 = _interopRequireDefault(_memo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Thing.find({}).remove()
//  .then(() => {
//    Thing.create({
//      name: 'Development Tools',
//      info: 'Integration with popular tools such as Bower, Grunt, Babel, Karma, ' +
//             'Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, ' +
//             'Stylus, Sass, and Less.'
//    }, {
//      name: 'Server and Client integration',
//      info: 'Built with a powerful and fun stack: MongoDB, Express, ' +
//             'AngularJS, and Node.'
//    }, {
//      name: 'Smart Build System',
//      info: 'Build system ignores `spec` files, allowing you to keep ' +
//             'tests alongside code. Automatic injection of scripts and ' +
//             'styles into your index.html'
//    }, {
//      name: 'Modular Structure',
//      info: 'Best practice client and server structures allow for more ' +
//             'code reusability and maximum scalability'
//    }, {
//      name: 'Optimized Build',
//      info: 'Build process packs up your templates as a single JavaScript ' +
//             'payload, minifies your scripts/css/images, and rewrites asset ' +
//             'names for caching.'
//    }, {
//      name: 'Deployment Ready',
//      info: 'Easily deploy your app to Heroku or Openshift with the heroku ' +
//             'and openshift subgenerators'
//    });
//  });

/**
 * Cypher - Danny
 * FT - Miah
 */
_userModel2.default.find({}).remove().then(function () {
  _userModel2.default.create({
    provider: 'local',
    role: 'admin',
    username: 'Danny',
    password: 'danny',
    firstName: 'Danny',
    email: 'danny@test.com',
    name: 'Danny'
  }, {
    provider: 'local',
    role: 'admin',
    username: 'Jeremiah',
    password: 'jeremiah',
    firstName: 'Jeremiah',
    email: 'Jeremiah@test.com',
    name: 'Jeremiah'
  }, {
    provider: 'local',
    role: 'user',
    username: 'TestUser1',
    password: 'testuser1',
    firstName: 'TestUser1',
    email: 'user1@test.com',
    name: 'TestUser1'
  }, {
    provider: 'local',
    role: 'user',
    username: 'TestUser2',
    password: 'testuser2',
    firstName: 'TestUser2',
    email: 'user2@test.com',
    name: 'TestUser2'
  }, {
    provider: 'local',
    role: 'user',
    username: 'TestUser3',
    password: 'testuser3',
    firstName: 'TestUser3',
    email: 'user3@test.com',
    name: 'TestUser3'
  }).then(function () {
    console.log('finished populating users');
  });
});
//# sourceMappingURL=seed.js.map
