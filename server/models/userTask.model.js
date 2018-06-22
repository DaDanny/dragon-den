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

var UserTaskSchema = BaseSchema.extend({
  actualTTC: String,
  task: { type: Schema.Types.ObjectId, ref: 'Task' },
  status: String,
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  priority: String
});

exports.default = mongoose.model('UserTask', UserTaskSchema);
//# sourceMappingURL=userTask.model.js.map
