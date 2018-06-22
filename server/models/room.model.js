'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _base = require('./base.model');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by Danny on 7/15/16.
 */
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');

var dateUtil = require('./../components/Date.Utils');
var BaseSchema = _base2.default.schema;
var Schema = mongoose.Schema;

var RoomSchema = BaseSchema.extend({
  width: String,
  length: String,
  amountOfPlants: Number,
  amountOfLights: Number,
  roomType: String,
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  startDate: { type: Date, set: dateUtil.standardizeDate },
  flippedDate: { type: Date, default: null },
  endDate: { type: Date, set: dateUtil.standardizeDate },
  lightsOn: Date,
  lightsOff: Date,
  timelines: [{ type: Schema.Types.ObjectId, ref: 'RoomTimeline' }],
  amountOfReservoirs: Number,
  amountOfTables: Number,
  amountOfFlats: Number,
  amountOfMachines: Number,
  TBDTasks: Array,
  mainColor: String,
  fullCycles: Array,
  generatedVegTasks: { type: Date, set: dateUtil.standardizeDate },
  generatedFlowerTasks: { type: Date, set: dateUtil.standardizeDate },
  taskGenerationEvents: { type: Array, default: [] }

});

RoomSchema.pre('find', buildRoom);

function buildRoom(next) {
  this.populate('tasks');
  this.populate('timelines');
  next();
}

var dateHooks = ['startDate', 'endDate', 'flippedDate'];

RoomSchema.pre('save', function (next) {
  var _this = this;

  dateHooks.map(function (date) {
    if (_this[date] && _this.isModified(date)) {
      _this[date] = dateUtil.standardizeDate(_this[date]);
    }
  });

  //if(this.startDate) this.startDate = dateUtil.standardizeDate(this.startDate);
  //if(this.flippedDate) this.flippedDate = dateUtil.standardizeDate(this.flippedDate);
  //if(this.endDate) this.endDate = dateUtil.standardizeDate(this.endDate);
  next();
});

exports.default = mongoose.model('Room', RoomSchema);
//# sourceMappingURL=room.model.js.map
