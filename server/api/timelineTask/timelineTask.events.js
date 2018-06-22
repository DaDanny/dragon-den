/**
 * TimelineTask model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _timelineTask = require('./../../models/timelineTask.model');

var _timelineTask2 = _interopRequireDefault(_timelineTask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TimelineTaskEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
TimelineTaskEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _timelineTask2.default.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    TimelineTaskEvents.emit(event + ':' + doc._id, doc);
    TimelineTaskEvents.emit(event, doc);
  };
}

exports.default = TimelineTaskEvents;
//# sourceMappingURL=timelineTask.events.js.map
