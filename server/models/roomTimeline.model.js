'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var RoomTimelineSchema = new _mongoose2.default.Schema({
  timelineTasks: [{ type: Schema.Types.ObjectId, ref: 'TimelineTask' }],
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
  site: { type: Schema.Types.ObjectId, ref: 'Site' },
  forCycleStarting: String,
  tlName: String
});

RoomTimelineSchema.pre('find', getTasks);

function getTasks(next) {
  this.populate('timelineTasks');
  next();
}

exports.default = _mongoose2.default.model('RoomTimeline', RoomTimelineSchema);
//# sourceMappingURL=roomTimeline.model.js.map
