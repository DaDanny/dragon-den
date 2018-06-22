'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _base = require('./base.model');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var BaseSchema = _base2.default.schema;
var dateUtil = require('./../components/Date.Utils');

var DeletedTLTaskSchema = BaseSchema.extend({
  occurrenceDate: { type: Date, set: dateUtil.standardizeDate },
  forCycleStarting: { type: Date, set: dateUtil.standardizeDate },
  completed: { type: Boolean, default: false },
  completedDate: { type: Date, set: dateUtil.standardizeDate },
  completedByUser: String,
  priority: { type: String, default: 'normal' },
  subPriority: { type: Object, default: {
      color: '#4CAF50',
      sortLevel: 14
    } },
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
  site: { type: Schema.Types.ObjectId, ref: 'Site' },
  notes: { type: String, default: '' },
  taskDetails: { type: String, default: '' },
  hasProblem: { type: Boolean, default: false },
  problemText: { type: String, default: '' },
  hasProblemDate: { type: Date, set: dateUtil.standardizeDate },
  problemByUser: String,
  notNeeded: { type: Boolean, default: false },
  notNeedText: { type: String, default: '' },
  notNeededDate: { type: Date, set: dateUtil.standardizeDate },
  notNeededByUser: String,
  taskDay: String,
  taskWeek: String,
  inPeriod: String,
  title: String,
  backgroundColor: String,
  warningColor: String,
  timeEstimate: Object,
  occurrenceObj: Object,
  occurrenceInfo: Object,
  isMaster: { type: Boolean, default: false },
  taskTLTemplate: { type: Schema.Types.ObjectId, ref: 'Timeline' },
  taskType: String,
  checkTemplateObj: { type: Boolean },
  taskRepeatCustom: Number,
  taskRepeatPreset: String,
  taskRepeatDays: Array,
  taskLastBuilt: { type: Date, set: dateUtil.standardizeDate },
  testTask: Boolean,
  templateId: { type: Schema.Types.ObjectId },
  masterCheckLocation: String,
  taskEvents: Array,
  images: Array,
  isChildTask: { type: Boolean, default: false },
  parentTask: { type: Schema.Types.ObjectId, ref: 'TimelineTask' },
  previousParentTask: { type: Schema.Types.ObjectId, ref: 'TimelineTask' },
  childTasks: [{ type: Schema.Types.ObjectId, ref: 'TimelineTask' }],
  childIndex: { type: Number, default: null },
  fromTLTemplate: { type: Schema.Types.ObjectId, ref: 'Timeline' },
  deletedDate: { type: Date }
}, {
  timestamps: true
});

exports.default = _mongoose2.default.model('DeletedTLTask', DeletedTLTaskSchema);
//# sourceMappingURL=deletedTLTask.model.js.map
