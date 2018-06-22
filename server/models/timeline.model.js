'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema; /**
                                         * Created by Danny on 10/7/16.
                                         */


var TimelineSchema = Schema({
  tasks: [{ type: Schema.Types.ObjectId, ref: 'TimelineTask' }],
  timelineName: String,
  timelineMainColor: String,
  timelineSubColor: String
}, {
  timestamps: true
});

exports.default = _mongoose2.default.model('Timeline', TimelineSchema);
//# sourceMappingURL=timeline.model.js.map
