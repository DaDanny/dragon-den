'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _base = require('./base.model');

var _base2 = _interopRequireDefault(_base);

var _mongoose = require('mongoose');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by Danny on 11/13/16.
 */

var mongoose = require('mongoose');

var BaseSchema = _base2.default.schema;
var async = require('async');


var MasterTimelineTaskSchema = new _mongoose.Schema({
  title: String,
  backgroundColor: String,
  warningColor: String,
  timeEstimate: Object,
  notes: String,
  occurrenceObj: Object
});

exports.default = mongoose.model('MasterTimelineTask', MasterTimelineTaskSchema);
//# sourceMappingURL=masterTimelineTask.model.js.map
