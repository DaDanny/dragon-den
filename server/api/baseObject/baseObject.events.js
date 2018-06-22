/**
 * BaseObject model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var mongoose = require('mongoose'),
    BaseObject = mongoose.model('BaseModel'),
    BaseObjectEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
BaseObjectEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  BaseObject.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    BaseObjectEvents.emit(event + ':' + doc._id, doc);
    BaseObjectEvents.emit(event, doc);
  };
}

exports.default = BaseObjectEvents;
//# sourceMappingURL=baseObject.events.js.map
