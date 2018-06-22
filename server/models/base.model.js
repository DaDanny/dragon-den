'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BaseSchema = _mongoose2.default.Schema({
  name: String
}); /**
     * Created by Danny on 7/14/16.
     */
exports.default = _mongoose2.default.model('BaseModel', BaseSchema);
//# sourceMappingURL=base.model.js.map
