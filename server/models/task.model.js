'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _base = require('./base.model');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by Danny on 7/17/16.
 */
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');

var BaseSchema = _base2.default.schema;
var Schema = mongoose.Schema;

var TaskSchema = BaseSchema.extend({
  estimatedTTC: String,
  taskType: String,
  schedule: String,
  scheduleDate: Date,
  taskItems: Array,
  selectedItemIndex: Number,
  confirmText: String,
  requiresVerification: Boolean,
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  priority: String
});

TaskSchema.pre('find', populateTasks);

function populateTasks(next) {
  this.populate('tasks');
  next();
}
exports.default = mongoose.model('Task', TaskSchema);
//# sourceMappingURL=task.model.js.map
