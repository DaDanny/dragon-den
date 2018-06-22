'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _base = require('./base.model');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var extend = require('mongoose-schema-extend'); /**
                                                 * Created by Danny on 7/13/16.
                                                 */

var Schema = _mongoose2.default.Schema;

var BaseSchema = _base2.default.schema;
var async = require('async');

var SiteSchema = BaseSchema.extend({
  team: Array,
  tasksToday: Array,
  tasksCompleted: Array,
  rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
  mainColor: String,
  subColor: String,
  reoccurringTasks: [{ type: Schema.Types.ObjectId, ref: 'TimelineTask' }],
  displayName: String,
  isNonGrow: { type: Boolean, default: false }
});

SiteSchema.pre('find', populateRooms);

function populateRooms(next) {
  this.populate('rooms');
  next();
}

exports.default = _mongoose2.default.model('Site', SiteSchema);
//# sourceMappingURL=site.model.js.map
