'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;
var MediaSchema = new Schema({
  mediaType: String,
  mediaUrl: String,
  uploadByUser: Schema.Types.ObjectId,
  uploadDate: Date,
  mediaName: String
});

exports.default = _mongoose2.default.model('Media', MediaSchema);
//# sourceMappingURL=media.model.js.map
