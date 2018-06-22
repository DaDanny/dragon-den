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
                                                 * Created by Danny on 9/23/16.
                                                 */

var Schema = _mongoose2.default.Schema;

var BaseSchema = _base2.default.schema;
var RoomTimeline = _mongoose2.default.model('RoomTimeline');
var Site = _mongoose2.default.model('Site');
var async = require('async');
var dateUtil = require('./../components/Date.Utils');
var FDate = require('./fDate.type');
var explain = require('mongoose-explain');
var _ = require('lodash');
var DeletedTLTask = _mongoose2.default.model('DeletedTLTask');

var TimelineTaskSchema = BaseSchema.extend({
  occurrenceDate: { type: Date, set: dateUtil.standardizeDate },
  forCycleStarting: { type: Date, set: dateUtil.standardizeDate },
  completed: { type: Boolean, default: false },
  completedDate: { type: Date, set: dateUtil.standardizeDate },
  completedByUser: String,
  priority: { type: String, default: 'normal' },
  subPriority: { type: Object, default: {
      color: '#4CAF50',
      sortLevel: 14
    } },
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
  site: { type: Schema.Types.ObjectId, ref: 'Site' },
  notes: { type: String, default: '' },
  taskDetails: { type: String, default: '' },
  hasProblem: { type: Boolean, default: false },
  problemText: { type: String, default: '' },
  hasProblemDate: { type: Date, set: dateUtil.standardizeDate },
  problemByUser: String,
  notNeeded: { type: Boolean, default: false },
  notNeedText: { type: String, default: '' },
  notNeededDate: { type: Date, set: dateUtil.standardizeDate },
  notNeededByUser: String,
  taskDay: String,
  taskWeek: String,
  inPeriod: String,
  title: String,
  backgroundColor: String,
  warningColor: String,
  timeEstimate: Object,
  occurrenceObj: Object,
  occurrenceInfo: Object,
  isMaster: { type: Boolean, default: false },
  taskTLTemplate: { type: Schema.Types.ObjectId, ref: 'Timeline' },
  taskType: String,
  checkTemplateObj: { type: Boolean },
  taskRepeatCustom: Number,
  taskRepeatPreset: String,
  taskRepeatDays: Array,
  taskLastBuilt: { type: Date, set: dateUtil.standardizeDate },
  testTask: Boolean,
  templateId: { type: Schema.Types.ObjectId },
  masterCheckLocation: String,
  taskEvents: Array,
  images: Array,
  isChildTask: { type: Boolean, default: false },
  parentTask: { type: Schema.Types.ObjectId, ref: 'TimelineTask' },
  previousParentTask: { type: Schema.Types.ObjectId, ref: 'TimelineTask' },
  childTasks: [{ type: Schema.Types.ObjectId, ref: 'TimelineTask' }],
  childIndex: { type: Number, default: null },
  fromTLTemplate: { type: Schema.Types.ObjectId, ref: 'Timeline' },
  masterTaskId: { type: Schema.Types.ObjectId, ref: 'TimelineTask' }
}, {
  timestamps: true
});

TimelineTaskSchema.pre('remove', function (next) {
  var taskId = this._id,
      siteId = null;
  if (this.site && !this.site._id) {
    siteId = this.site;
  } else if (this.site) {
    siteId = this.site._id;
  }
  if (this.checkTemplateObj && !this.isMaster) {
    Site.findByIdAndUpdate(siteId, { $pull: { reoccurringTasks: taskId } }, function (err, site) {
      if (err) next(err);else next();
    });
  } else {
    next();
  }
});

TimelineTaskSchema.pre('remove', function (next) {
  var deletedTLTask = new DeletedTLTask(this.toObject());
  deletedTLTask.deletedDate = new Date();
  deletedTLTask.__t = 'DeletedTLTask';
  deletedTLTask.save(function (err) {
    next();
  });
});

//TimelineTaskSchema.pre('find', function(next) {
//  this.populate('site room');
//  next();
//})

var dateHooks = ['occurrenceDate', 'endDate', 'flippedDate'];

TimelineTaskSchema.path('parentTask').set(function (newVal) {
  var originalParent = this.parentTask;
  if (originalParent && !originalParent.equals(newVal)) {
    this.previousParentTask = originalParent;
    var prevParent = originalParent;
    if (prevParent._id) this.previousParentTask = prevParent._id;else this.previousParentTask = prevParent;
  } else {
    this.previousParentTask = newVal;
  }
  return newVal;
});

TimelineTaskSchema.pre('save', function (next) {
  var parentTaskId = this.parentTask,
      childTaskId = this._id,
      previousParentTaskId = this.previousParentTask,
      self = this;
  if (parentTaskId && parentTaskId._id) parentTaskId = parentTaskId._id;
  if (previousParentTaskId && previousParentTaskId._id) previousParentTaskId = previousParentTaskId._id;
  // If we created a new child task, add the new task to it's parent's childTasks array
  if (this.isNew && this.parentTask) {
    this.isChildTask = true;
    this.constructor.findByIdAndUpdate(parentTaskId, { $addToSet: { childTasks: childTaskId } }).exec(function (err, parentTask) {
      if (err) next(err);else next();
    });
  } else if (parentTaskId && !parentTaskId.equals(previousParentTaskId)) {
    // If we changed parent tasks, remove child from previous parent
    this.constructor.findByIdAndUpdate(previousParentTaskId, { $pull: { childTasks: childTaskId } }).exec(function (err, parentTask) {
      if (err) next(err);else {
        // Be sure to save it to the new parent
        self.previousParentTask = parentTaskId;
        self.constructor.findByIdAndUpdate(parentTaskId, { $addToSet: { childTasks: childTaskId } }).exec(function (err, parentTask) {
          if (err) next(err);else next();
        });
      }
    });
  } else if (this.isModified('parentTask')) {
    if (!this.parentTask && this.previousParentTask) {
      self.constructor.findByIdAndUpdate(previousParentTaskId, { $pull: { childTasks: childTaskId } }).exec(function (err, parentTask) {
        if (err) next(err);else next();
      });
    } else if (this.parentTask && this.previousParentTask) {
      self.constructor.findByIdAndUpdate(parentTaskId, { $addToSet: { childTasks: childTaskId } }).exec(function (err, parentTask) {
        if (err) next(err);else next();
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

TimelineTaskSchema.post('save', function () {
  if (this.isChildTask) {
    var task = this;
    var parentTaskId = task.parentTask;
    this.constructor.findById(parentTaskId).populate('childTasks').exec(function (err, parentTask) {
      if (!err && parentTask) {
        var updatedParent = _.extend(parentTask, checkChildTasks(parentTask));
        updatedParent.save(function (err) {
          if (err) console.log('update parent err', err);else console.log('updated parent success');
        });
      }
    });
  }
});

function checkChildTasks(parentTask) {
  var hasIssue = checkForIssueChild(parentTask);
  if (hasIssue.hasProblem) {
    parentTask.hasProblem = true;
    parentTask.problemByUser = hasIssue.problemByUser;
    parentTask.hasProblemDate = hasIssue.hasProblemDate;
    parentTask.completed = false;
    parentTask.completedDate = null;
    parentTask.completedByUser = null;
    return parentTask;
  } else {
    parentTask.hasProblem = false;
    parentTask.problemByUser = null;
    parentTask.hasProblemDate = null;
  }

  var completed = checkForCompletedChildren(parentTask);
  if (completed.completed) {
    parentTask.hasProblem = false;
    parentTask.problemByUser = null;
    parentTask.hasProblemDate = null;
    parentTask.completed = true;
    parentTask.completedDate = completed.completedDate;
    parentTask.completedByUser = completed.completedByUser;
    return parentTask;
  } else {
    parentTask.completed = false;
    parentTask.completedDate = null;
    parentTask.completedByUser = null;
  }
  return parentTask;
}

function checkForIssueChild(parentTask) {
  var issueTasks = _.filter(parentTask.childTasks, 'hasProblem');
  var newestIssueTask = _.max(issueTasks, function (o) {
    return new Date(o.hasProblemDate).getTime();
  });
  if (newestIssueTask) {
    return {
      hasProblem: true,
      problemByUser: newestIssueTask.problemByUser,
      hasProblemDate: newestIssueTask.hasProblemDate
    };
  } else {
    return {
      hasProblem: false
    };
  }
}

function checkForCompletedChildren(parentTask) {
  var completedTasks = _.every(parentTask.childTasks, function (c) {
    return c.completed || c.notNeeded;
  });

  if (completedTasks) {
    var newestCompleted = _.max(parentTask.childTasks, function (o) {
      if (o.notNeeded) {
        return new Date(o.notNeededDate).getTime();
      } else if (o.completed) {
        return new Date(o.completedDate).getTime();
      }
    });
    if (newestCompleted) {
      if (newestCompleted.notNeeded) {
        return {
          completed: true,
          completedByUser: newestCompleted.notNeededByUser,
          completedDate: newestCompleted.notNeededDate
        };
      } else {
        return {
          completed: true,
          completedByUser: newestCompleted.completedByUser,
          completedDate: newestCompleted.completedDate
        };
      }
    } else {
      return {
        completed: false
      };
    }
  } else {
    return {
      completed: false
    };
  }
}

TimelineTaskSchema.index({ room: 1 });
TimelineTaskSchema.index({ site: 1 });
TimelineTaskSchema.index({ room: 1, taskType: 1 });
TimelineTaskSchema.index({ isMaster: 1, taskType: 1 });
TimelineTaskSchema.index({ checkTemplateObj: 1 });
//TimelineTaskSchema.plugin(explain);

exports.default = _mongoose2.default.model('TimelineTask', TimelineTaskSchema);
//# sourceMappingURL=timelineTask.model.js.map
