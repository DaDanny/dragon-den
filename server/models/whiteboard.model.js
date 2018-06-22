'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _base = require('./base.model');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by Danny on 7/14/17.
 */
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');

var BaseSchema = _base2.default.schema;

var WhiteboardSchema = BaseSchema.extend({
  text: String,
  images: Array
});

exports.default = mongoose.model('Whiteboard', WhiteboardSchema);
//# sourceMappingURL=whiteboard.model.js.map
