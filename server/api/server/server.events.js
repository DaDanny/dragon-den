/**
 * Server model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _server = require('./server.model');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ServerEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
ServerEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _server2.default.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    ServerEvents.emit(event + ':' + doc._id, doc);
    ServerEvents.emit(event, doc);
  };
}

exports.default = ServerEvents;
//# sourceMappingURL=server.events.js.map
