/**
 * Memo model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _memo = require('../../models/memo.model');

var _memo2 = _interopRequireDefault(_memo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MemoEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
MemoEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _memo2.default.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    MemoEvents.emit(event + ':' + doc._id, doc);
    MemoEvents.emit(event, doc);
  };
}

exports.default = MemoEvents;
//# sourceMappingURL=memo.events.js.map
