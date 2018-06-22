'use strict';

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');
var dateUtil = require('./../components/Date.Utils');

function FDate(key, options) {
  mongoose.SchemaType.call(this, key, options, 'FDate');
}

FDate.prototype = (0, _create2.default)(mongoose.SchemaType.prototype);

FDate.prototype.cast = function (val) {
  var _date = new Date(val);
  console.log('_date', _date);
  if (_date instanceof Date && !isNaN(_date.valueOf())) {
    _date = dateUtil.standardizeDate(_date);
    return _date;
  } else {
    console.log('here: ');
    throw new Error('FDate' + val + ' is not a date.');
  }
};

mongoose.Schema.Types.FDate = FDate;
//# sourceMappingURL=fDate.type.js.map
