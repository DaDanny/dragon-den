'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _base = require('./base.model');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var extend = require('mongoose-schema-extend');
var Schema = _mongoose2.default.Schema;

var BaseSchema = _base2.default.schema;

var MemoSchema = new Schema({
  name: String,
  info: String,
  active: Boolean,
  priority: { type: String, default: 'normal' },
  subPriority: { type: Object, default: {
      color: '#4CAF50',
      sortLevel: 14
    } },
  rightBarColor: Object,
  leftBarColor: Object,
  titleTextColor: Object,
  memoBarColor: Object,
  notes: { type: String, default: '' },
  title: String,
  backgroundColor: String,
  warningColor: String,
  memoType: String,
  images: Array,
  isChildMemo: { type: Boolean, default: false },
  parentMemo: { type: Schema.Types.ObjectId, ref: 'Memo' },
  previousParentMemo: { type: Schema.Types.ObjectId, ref: 'Memo' },
  childMemos: [{ type: Schema.Types.ObjectId, ref: 'Memo' }],
  childIndex: { type: Number, default: null },
  parentIndex: { type: Number, default: null }
}, {
  timestamps: true
});

MemoSchema.path('parentMemo').set(function (newVal) {
  var originalParent = this.parentMemo;
  if (originalParent && !originalParent.equals(newVal)) {
    this.previousParentMemo = originalParent;
    var prevParent = originalParent;
    if (prevParent._id) this.previousParentMemo = prevParent._id;else this.previousParentMemo = prevParent;
  } else {
    this.previousParentMemo = newVal;
  }
  return newVal;
});

MemoSchema.pre('save', function (next) {
  var parentMemoId = this.parentMemo,
      childMemoId = this._id,
      previousParentMemoId = this.previousParentMemo,
      self = this;
  if (parentMemoId && parentMemoId._id) parentMemoId = parentMemoId._id;
  if (previousParentMemoId && previousParentMemoId._id) previousParentMemoId = previousParentMemoId._id;
  // If we created a new child Memo, add the new Memo to it's parent's childMemos array
  if (this.isNew && this.parentMemo) {
    this.isChildMemo = true;
    this.constructor.findByIdAndUpdate(parentMemoId, { $addToSet: { childMemos: childMemoId } }).exec(function (err, parentMemo) {
      if (err) next(err);else next();
    });
  } else if (parentMemoId && !parentMemoId.equals(previousParentMemoId)) {
    // If we changed parent Memos, remove child from previous parent
    this.constructor.findByIdAndUpdate(previousParentMemoId, { $pull: { childMemos: childMemoId } }).exec(function (err, parentMemo) {
      if (err) next(err);else {
        // Be sure to save it to the new parent
        self.previousParentMemo = parentMemoId;
        self.constructor.findByIdAndUpdate(parentMemoId, { $addToSet: { childMemos: childMemoId } }).exec(function (err, parentMemo) {
          if (err) next(err);else next();
        });
      }
    });
  } else if (this.isModified('parentMemo')) {
    if (!this.parentMemo && this.previousParentMemo) {
      self.constructor.findByIdAndUpdate(previousParentMemoId, { $pull: { childMemos: childMemoId } }).exec(function (err, parentMemo) {
        if (err) next(err);else next();
      });
    } else if (this.parentMemo && this.previousParentMemo) {
      self.constructor.findByIdAndUpdate(parentMemoId, { $addToSet: { childMemos: childMemoId } }).exec(function (err, parentMemo) {
        if (err) next(err);else next();
      });
    } else {
      next();
    }
  } else {
    next();
  }
});
exports.default = _mongoose2.default.model('Memo', MemoSchema);
//# sourceMappingURL=memo.model.js.map
