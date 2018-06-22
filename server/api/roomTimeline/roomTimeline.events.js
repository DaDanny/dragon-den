/**
 * RoomTimeline model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _roomTimelineModel = require('./../../models/roomTimeline.model.js');

var _roomTimelineModel2 = _interopRequireDefault(_roomTimelineModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RoomTimelineEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
RoomTimelineEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _roomTimelineModel2.default.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    RoomTimelineEvents.emit(event + ':' + doc._id, doc);
    RoomTimelineEvents.emit(event, doc);
  };
}

exports.default = RoomTimelineEvents;
//# sourceMappingURL=roomTimeline.events.js.map
