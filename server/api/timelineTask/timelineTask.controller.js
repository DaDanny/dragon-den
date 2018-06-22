/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/timelineTasks              ->  index
 * POST    /api/timelineTasks              ->  create
 * GET     /api/timelineTasks/:id          ->  show
 * PUT     /api/timelineTasks/:id          ->  update
 * DELETE  /api/timelineTasks/:id          ->  destroy
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.index = index;
exports.show = show;
exports.create = create;
exports.createNewTimeline = createNewTimeline;
exports.updateTimeline = updateTimeline;
exports.copyToTimelines = copyToTimelines;
exports.deleteTimeline = deleteTimeline;
exports.getAllTimelines = getAllTimelines;
exports.copyMasterTL = copyMasterTL;
exports.update = update;
exports.destroy = destroy;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _mongoParse = require('mongo-parse');

var _mongoParse2 = _interopRequireDefault(_mongoParse);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _room = require('./../../models/room.model');

var _room2 = _interopRequireDefault(_room);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import TimelineTask from './../../models/timelineTask.model';
var TimelineTask = _mongoose2.default.model('TimelineTask');
var DeletedTLTask = _mongoose2.default.model('DeletedTLTask');
var Timeline = _mongoose2.default.model('Timeline');
var MasterTasksCtrl = require('./../masterTimeline/masterTimeline.controller');
var dateUtil = require('./../../components/Date.Utils');
var Utils = require('../../components/Utils');
var RoomTimelineCtrl = require('./../roomTimeline/roomTimeline.controller');
var SiteCtrl = require('./../site/site.controller');

var moment = require('moment');
var Q = require('q');
var async = require('async');
var CronJob = require('cron').CronJob;

//new CronJob('10 * * * * 0-6', function() {
//  var today = moment().startOf('day')
//  console.log('today: ', today);
//  console.log('Test Time!');
//}, null, true, null);

new CronJob('00 00 4 * * 0-6', function () {
  reoccurringGenerator();
  clearRecentlyDeleted();
}, null, true, 'America/Los_Angeles');

TimelineTask.on('index', function (err) {
  if (err) {
    console.log('index err', err);
  } else {
    console.log('inexed fine!');
  }
});

var masterPeriods = {
  'veg': {
    periodLength: 21,
    percent: 21 / 77
  },
  'flower': {
    periodLength: 56,
    percent: 56 / 77
  }
};

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function (entity) {
    var updated = _lodash2.default.extend(entity, updates);
    return updated.save().then(function (updated) {
      return updated;
    });
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove().then(function () {
        res.status(204).end();
      });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of TimelineTasks
function index(req, res) {
  return TimelineTask.find().exec().then(respondWithResult(res)).catch(handleError(res));
}

exports.timelineQuery = function (req, res) {
  var query = req.body;
  var recentlyDeleted = query.recentlyDeleted;
  var requestTime = req.headers.requesttime;
  var referer = req.headers.referer;
  var builtQuery = queryBuilder(query, req.headers.appversion, requestTime, recentlyDeleted);
  builtQuery.lean().exec(function (err, tlTasks) {
    if (err) return res.status(400).json(err);else {
      return res.status(200).json(tlTasks);
    }
  });
};

function queryBuilder(queryObj, appVersion, requestTime, recentlyDeleted) {
  var newVersion = false,
      incluldeNonGrows = false;
  var dailyCheckDay;
  var today = moment();
  var taskFilter,
      queryFilters,
      haveFilters = false,
      TTFilters,
      clarityFilter,
      dateFilter;
  var query;
  var queryModel = TimelineTask;

  if (recentlyDeleted) {
    queryModel = DeletedTLTask;
  }
  if (queryObj.taskFilter) {
    taskFilter = queryObj.taskFilter;
  }
  if (queryObj.queryFilters) {
    queryFilters = queryObj.queryFilters;
    haveFilters = true;
    TTFilters = findTTFilters(queryFilters);
    clarityFilter = findClarityFilter(queryFilters);
    dateFilter = findDateFilter(queryFilters);
  }
  var yesterday = moment(today).subtract(1, 'days');
  if (requestTime) {
    var requestHour = new Date(requestTime).getHours();
  } else {
    dailyCheckDay = yesterday;
  }
  var compareVersions = Utils.compareVersions(appVersion, "0.1.0");
  if (compareVersions >= 0) {
    newVersion = true;
  }

  queryObj = parseQuery(queryObj);
  var taskTypeArr = _lodash2.default.cloneDeep(queryObj.taskType);
  console.log('task types', taskTypeArr);

  var dateF,
      dateFilterDays,
      filterDaysAgo,
      hasDateFilterDays = false;

  if (dateFilter && dateFilter.length > 0) {
    dateF = dateFilter[0];
    if (dateF && dateF.queryObj) {
      dateFilterDays = dateF.queryObj.occurrenceDate, filterDaysAgo = moment(today).subtract(dateFilterDays, 'days');

      hasDateFilterDays = true;
    }
  }
  var weekBack = moment(today).subtract(7, 'days');
  var daysAgo = moment(today).subtract(80, 'days');
  if (queryObj.isMaster) {
    var taskTLTemplateQuery = {};
    if (queryObj.taskTLTemplate) {
      taskTLTemplateQuery = {
        taskTLTemplate: queryObj.taskTLTemplate
      };
    } else {
      taskTLTemplateQuery = {
        taskTLTemplate: null
      };
    }
    query = queryModel.find().and([{ isMaster: true }, { taskType: { $in: queryObj.taskType } }, { taskTLTemplate: queryObj.taskTLTemplate }]);
  } else {
    var checkTemplateObjQuery;
    if (queryObj.checkTemplateObj) {
      checkTemplateObjQuery = { $eq: true };
    } else {
      checkTemplateObjQuery = { $in: [null, false] };
    }

    query = queryModel.find().and([{ $or: [{ room: { $in: queryObj.room } }, { site: { $in: queryObj.site } }] }, { isMaster: false }, { checkTemplateObj: checkTemplateObjQuery }]);

    if (queryObj.hideRooms && queryObj.hideRooms.length) {
      query.and([{ room: { $nin: queryObj.hideRooms } }]);
    }

    if (!queryObj.checkTemplateObj) {
      var dailyCheckIdx = queryObj.taskType.indexOf('daily-check');
      if (dailyCheckIdx > -1) {
        queryObj.taskType.splice(dailyCheckIdx, 1);
        console.log('length', taskTypeArr.length);
        if (taskTypeArr.length === 1 && hasDateFilterDays) {
          query.or([{ $and: [{ taskType: 'daily-check' }, { occurrenceDate: { $gte: filterDaysAgo.toDate() } }] }]);
        } else {
          query.or([{ $and: [{ taskType: 'daily-check' }, { occurrenceDate: { $gte: yesterday.toDate() } }] }]);
        }
      }
      var xCheckIdx = queryObj.taskType.indexOf('x-check');
      if (xCheckIdx > -1) {
        queryObj.taskType.splice(xCheckIdx, 1);
        if (taskTypeArr.length === 1 && hasDateFilterDays) {
          query.or([{ $and: [{ taskType: 'x-check' }, { occurrenceDate: { $gte: filterDaysAgo.toDate() } }] }]);
        } else {
          query.or([{ $and: [{ taskType: 'x-check' }, { occurrenceDate: { $gte: weekBack.toDate() } }] }]);
        }
      }

      var tunnelTL = queryObj.taskType.indexOf('tunnel-timeline');
      if (tunnelTL > -1) {
        var ttQuery,
            updatedTTQuery = false,
            hasTTDate = false;
        if (queryObj.TLFromDate && queryObj.TLToDate) {
          updatedTTQuery = true;
          hasTTDate = true;
          _lodash2.default.pull(queryObj.taskType, 'tunnel-timeline');
          ttQuery = [{ $and: [{ taskType: 'tunnel-timeline' }, { occurrenceDate: {
                $gte: queryObj.TLFromDate,
                $lte: queryObj.TLToDate
              } }]
          }];
        }

        if (haveFilters) {
          _lodash2.default.pull(queryObj.taskType, 'tunnel-timeline');
        }
        if (TTFilters) {
          var ttOr = _lodash2.default.map(TTFilters, function (f) {
            return f.queryObj;
          });
          if (ttOr && ttOr.length > 0) {
            updatedTTQuery = true;
            if (!ttQuery) {
              ttQuery = [{ $and: [{ taskType: 'tunnel-timeline' }, { $or: ttOr }]
              }];
            } else {
              ttQuery[0]['$and'].push({
                $or: ttOr
              });
            }
          }
        }

        if (updatedTTQuery) {
          if (hasDateFilterDays) {
            if (!hasTTDate) {
              ttQuery[0]['$and'].push({ occurrenceDate: { $gte: filterDaysAgo.toDate() } });
            }
          }

          query.or(ttQuery);
        }
      }
      query.or({ taskType: { $in: queryObj.taskType } });

      if (newVersion) {
        var hasAdmin = _lodash2.default.includes(queryObj.taskType, 'admin-assigned');
        if (hasAdmin) {
          var adminAnd = [{ taskType: 'admin-assigned' }, { isMaster: { $ne: true } }];

          if (queryObj.site && queryObj.site.length) {
            adminAnd.push({ $or: [{ site: { $in: queryObj.site } }, { site: { $eq: null } }] });
          } else {
            adminAnd.push({ site: { $eq: null } });
          }
          query = queryModel.find().or([{ '$and': adminAnd }, query.getQuery()]);

          //if(taskFilter) {
          //  console.log('add Task filter');
          //  if(taskFilter == 'ohShit') {
          //    query.and([{hasProblem : {$eq : true}}])
          //  }
          //}
        } else {}
      }
    } else {
      query.and([{ taskType: { $in: queryObj.taskType } }]);
    }

    if (taskFilter) {
      if (taskFilter === 'ohShit') {
        query.and([{ hasProblem: { $eq: true } }]);
      } else if (taskFilter === 'hideDone') {
        query.and([{ completed: { $ne: true } }, { notNeeded: { $ne: true } }]);
      }
    }

    if (clarityFilter) {
      _lodash2.default.map(clarityFilter, function (f) {
        var queryObj = f.queryObj;
        if (!queryObj) return;

        if (_lodash2.default.isArray(queryObj)) {
          query.and(queryObj);
        } else {
          query.and([queryObj]);
        }
      });
    }
  }

  //var queryParams = query['$and'];
  //console.log('params: ', queryParams);
  //var hasAdmin = false;
  //var taskTypeQuery = _.find(queryParams, (item) => _.has(item,'taskType'));
  //var isMasterObj = _.find(queryParams, (item) => _.has(item,'isMaster'));
  //var isMaster = isMasterObj['isMaster'];
  //if(taskTypeQuery.hasOwnProperty('taskType')) {
  //  var taskTypes = taskTypeQuery['taskType'];
  //  hasAdmin = _.indexOf(taskTypes['$in'],'admin-assigned');
  //  if(hasAdmin > -1) {
  //    query = {
  //      '$or' : [
  //        {'$and' : [
  //          {taskType : 'admin-assigned'},
  //          {isMaster : isMaster},
  //
  //        ]},
  //        {'$and' : query['$and']}
  //      ]
  //    }
  //  }
  //}
  //query.populate('site room');

  var populateVersion = Utils.compareVersions(appVersion, "1.0.2");
  if (populateVersion < 0) {
    console.log('app version', appVersion);
    query.populate('site room parentTask childTasks');
  } else {
    query.populate('parentTask childTasks');
  }

  return query;
}

function findTTFilters(filters) {
  var filtersCopy = _lodash2.default.cloneDeep(filters);
  return _lodash2.default.filter(filtersCopy, function (f) {
    return f.taskType === 'tunnel-timeline';
  });
}

function findClarityFilter(filters) {
  var filtersCopy = _lodash2.default.cloneDeep(filters);
  return _lodash2.default.remove(filtersCopy, function (f) {
    return f.clarityFilter;
  });
}

function findDateFilter(filters) {
  var filtersCopy = _lodash2.default.cloneDeep(filters);
  return _lodash2.default.remove(filtersCopy, function (f) {
    return f.queryType === 'date';
  });
}

function parseQuery(query) {
  var parsedQuery = {};
  _lodash2.default.map(query['$and'], function (item, key) {
    return findFieldValues(item, parsedQuery);
  });
  return parsedQuery;
}

function findFieldValues(item, parsedQuery) {
  for (var field in item) {
    if (item.hasOwnProperty(field)) {
      if (field === 'isMaster') {
        parsedQuery['isMaster'] = item[field];
        break;
      }
      if (field === 'taskType') {
        parsedQuery['taskType'] = item[field]['$in'];
        break;
      }
      if (field === 'taskTLTemplate') {
        parsedQuery['taskTLTemplate'] = item[field];
        break;
      }
      if (field === 'TLFromDate') {
        parsedQuery['TLFromDate'] = item[field];
        break;
      }
      if (field === 'TLToDate') {
        parsedQuery['TLToDate'] = item[field];
        break;
      }

      if (field === '$or' || field === '$and') {
        findFieldValues(item[field], parsedQuery);
      } else {
        _lodash2.default.map(item, function (o) {
          for (var property in o) {
            if (o.hasOwnProperty(property)) {
              if (property === 'room' || property === 'site') {
                if (o[property]['$in']) {
                  parsedQuery[property] = o[property]['$in'];
                  break;
                }
              } else if (property === 'checkTemplateObj') {
                parsedQuery['checkTemplateObj'] = o[property]['$eq'];
                break;
              } else if (property === '$nin') {
                if (field === 'room') {
                  parsedQuery['hideRooms'] = o[property];
                  break;
                }
              }
            }
          }
        });
      }
    }
  }
}

exports.newReoccurringTask = function (req, res) {
  var newTaskObj = new TimelineTask(req.body);
  newTaskObj.save(function (err) {
    if (err) return res.status(400).json(err);else {
      SiteCtrl.newReoccurringTask(newTaskObj).then(function (response) {
        TimelineTask.populate(newTaskObj, 'site room', function (err) {
          generateNewReoccurringTask(newTaskObj);
          return res.status(200).json(newTaskObj);
        });
      }).catch(function (err) {
        return res.status(400).json(err);
      });
    }
  });
};

function generateNewReoccurringTask(task) {
  var genDate = moment(dateUtil.standardizeDate(new Date()));
  filterOutTasks(genDate, [task], function (err, taskToGenerate) {
    if (!err && taskToGenerate.length) {
      generateTasks(genDate, taskToGenerate, function (err, generated) {
        console.log('generated: ', generated);
      });
    }
  });
}

exports.bulkUpdate = function (req, res) {
  TimelineTask.update({ "_id": { '$in': req.body.taskIds } }, req.body.updateObj, { multi: true }, function (err, tasks) {
    if (err) return res.status(400).json(err);else return res.status(200).json(tasks);
  });
};

exports.bulkTaskDelete = function (req, res) {
  var taskIds = req.body;
  var deletePromises = taskIds.map(function (taskId) {
    TimelineTask.findById(taskId, function (err, task) {
      return task.remove();
    });
  });

  Q.all(deletePromises).then(function (resp) {
    return res.status(200).json(resp);
  }).catch(function (err) {
    return res.status(400).json(err);
  });
};

exports.restoreTask = function (req, res) {
  var taskId = req.params.id;
  DeletedTLTask.findById(taskId).exec(function (err, task) {
    if (err) return res.status(400).json(err);else if (!task) return res.status(400).json({});else {
      var restoredTask = new TimelineTask(task.toObject());
      delete restoredTask.deletedDate;
      restoredTask.__t = 'TimelineTask';
      restoredTask.save(function (err) {
        if (!err) {
          var siteId;
          if (restoredTask.site && !restoredTask.site._id) {
            siteId = restoredTask.site;
          } else if (restoredTask.site) {
            siteId = restoredTask.site._id;
          }
          if (restoredTask.checkTemplateObj && !restoredTask.isMaster) {
            SiteCtrl.restoreReoccurringTask(restoredTask._id, siteId);
          }
        }
      });
      task.remove(function (err) {
        console.log('err', err);
        if (err) return res.status(400).json(err);else return res.status(200).json(restoredTask);
      });
    }
  });
};

// Gets a single TimelineTask from the DB
function show(req, res) {
  return TimelineTask.findById(req.params.id).populate('site room childTasks parentTask').exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
}

// Creates a new TimelineTask in the DB
function create(req, res) {
  var task = req.body;
  var newTaskObj = new TimelineTask(task);
  newTaskObj.save(function (err) {
    if (err) return res.status(400).json(err);else {
      TimelineTask.populate(newTaskObj, 'site room', function (err) {
        return res.status(200).json(newTaskObj);
      });
    }
  });
}

function createNewTimeline(req, res) {
  var timelineObj = new Timeline({
    timelineName: req.body.timelineName,
    timelineMainColor: req.body.timelineMainColor,
    timelineSubColor: req.body.timelineSubColor,
    tasks: []
  });
  timelineObj.save(function (err) {
    if (err) return res.status(400).json(err);else {
      return res.status(200).json(timelineObj);
    }
  });
}

function updateTimeline(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Timeline.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(saveUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

function copyToTimelines(req, res) {
  var copyToIds = req.body.copyToIds;
  var taskToCopy = req.body.taskToCopy;
  delete taskToCopy._id;
  delete taskToCopy._v;
  delete taskToCopy.occurrenceDate;
  var promises = _lodash2.default.map(copyToIds, function (tlId) {
    var newCopy = new TimelineTask(taskToCopy);
    newCopy.taskTLTemplate = tlId;
    if (taskToCopy.childTasks && taskToCopy.childTasks.length) {
      return buildParentTask(newCopy, taskToCopy);
    } else {
      return newCopy.save();
    }
  });

  Q.all(promises).then(function (results) {
    return res.status(200).json(results);
  }).catch(function (err) {
    return res.status(400).json(err);
  });
}

function deleteTimeline(req, res) {
  return Timeline.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}

// 280ms -> 1.7Kb
function getAllTimelines(req, res) {
  Timeline.find().exec(function (err, timelines) {
    if (err) return res.status(400).json(err);else {
      getTimelineTaskCount(timelines).then(function (taskCount) {
        return res.status(200).json(taskCount);
      }).catch(function (err) {
        return res.status(400).json(err);
      });
    }
  });
}

function copyMasterTL(req, res) {
  var copyToTL = req.body.copyToTL;
  var inPeriod = req.body.inPeriod;
  TimelineTask.find({ isMaster: true, taskType: 'tunnel-timeline', inPeriod: inPeriod, taskTLTemplate: null }).lean().exec(function (err, masterTasks) {
    if (err) return res.status(400).json(err);else {
      if (masterTasks && masterTasks.length) {
        var test = _lodash2.default.take(masterTasks, 4);
        var promises = _lodash2.default.map(masterTasks, function (mTask) {
          var mCopy = _lodash2.default.cloneDeep(mTask);
          delete mCopy._id;
          delete mCopy._v;
          delete mCopy.occurrenceDate;
          var newMaster = new TimelineTask(mCopy);
          newMaster.isNew = true;
          newMaster.taskTLTemplate = copyToTL;
          return newMaster.save();
        });

        Q.all(promises).then(function (results) {
          return res.status(200).json(results);
        }).catch(function (err) {
          return res.status(400).json(err);
        });
      }
    }
  });
}

function getTimelineTaskCount(timelines) {
  var deferred = Q.defer();
  var timelineIds = _lodash2.default.map(timelines, function (t) {
    return t._id;
  });
  TimelineTask.find({ isMaster: true }).where('taskTLTemplate').in(timelineIds).select('taskTLTemplate').lean(true).exec(function (err, tasks) {
    if (err) deferred.reject(err);else {
      var returnCounts = _lodash2.default.map(timelines, function (tl) {
        var taskCount = _lodash2.default.filter(tasks, function (task) {
          return tl._id.equals(task.taskTLTemplate);
        }).length;
        var tlCountObj = {
          taskCount: taskCount
        };
        _lodash2.default.assign(tlCountObj, tl.toObject());
        return tlCountObj;
      });
      deferred.resolve(returnCounts);
    }
  });

  return deferred.promise;
}

// Updates an existing TimelineTask in the DB
function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  if (req.body.roomDetails) {
    delete req.body.roomDetails;
  }
  if (req.body.masterTask) {
    delete req.body.masterTask;
  }
  return TimelineTask.findById(req.params.id).populate('site room parentTask childTasks').exec().then(handleEntityNotFound(res)).then(saveUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

// Deletes a TimelineTask from the DB
function destroy(req, res) {
  return TimelineTask.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}

exports.checkTLDates = function (req, res) {
  var startDate = moment(req.body.startDate);
  var room = req.body.room;
  var sameDateCount = 0;
  TimelineTask.find({ room: room }).lean().exec(function (err, tasks) {
    if (err) return res.status(200).json({});else {
      for (var t = 0; t < tasks.length; t++) {
        var taskDate = moment(dateUtil.standardizeDate(tasks[t].forCycleStarting));
        if (taskDate.isSame(startDate)) {
          sameDateCount++;
        }
      }
      if (sameDateCount > 0) {
        return res.status(400).json(sameDateCount);
      } else {
        return res.status(200).json({});
      }
    }
  });
};

var pickTaskDetails = ['priority', 'subPriority', 'room', 'site', 'notes', 'title', 'taskType'];

function reoccurringGenerator() {
  var genDate = moment(dateUtil.standardizeDate(new Date()));
  SiteCtrl.getAllReoccurringTasks(function (err, sites) {
    _lodash2.default.forEach(sites, genSiteTasks);
  });

  function genSiteTasks(site) {
    var tasks = site.reoccurringTasks;
    async.waterfall([async.apply(filterOutTasks, genDate, tasks), async.apply(generateTasks, genDate), async.apply(updateTemplateTasks, genDate)]);
  }
}

function clearRecentlyDeleted() {
  var today = moment(dateUtil.standardizeDate(new Date()));
  DeletedTLTask.find().exec(function (err, deleted) {
    if (deleted && deleted.length > 0) {
      _lodash2.default.map(deleted, function (d) {
        var deletedDate = moment(dateUtil.standardizeDate(d.deletedDate));
        var diff = Math.abs(today.diff(deletedDate, 'days'));
        if (diff >= 7) {
          d.remove();
        }
      });
    }
  });
}

exports.reoccurringTest = function (req, res) {
  var testInfo = req.body;
  var site = testInfo.site;
  var startDate = moment(dateUtil.standardizeDate(testInfo.startDate));

  async.waterfall([async.apply(SiteCtrl.getReoccurringTasks, site), async.apply(filterOutTasks, startDate), async.apply(generateTasks, startDate), async.apply(updateTemplateTasks, startDate)], function (err, results) {
    if (err) return res.status(400).json(err);else return res.status(200).json(results);
  });
};

function filterOutTasks(genDate, tasks, callback) {
  var filteredTasks = _lodash2.default.filter(tasks, function (task) {

    var newTask = false,
        taskDate;

    if (task.taskLastBuilt) {
      taskDate = moment(dateUtil.standardizeDate(task.taskLastBuilt));
    } else if (!task.taskLastBuilt && task.taskType != 'daily-check') {
      // New X-Check so check when it falls on
      newTask = true;
    } else {
      // Its a new daily so generate it
      return true;
    }

    if (!newTask) {
      if (Math.abs(genDate.diff(taskDate, 'days')) >= 1) {
        if (task.taskType == 'daily-check') {
          return true;
        }
      } else {
        console.log('generated today');
        // We've already built it for the day
        return false;
      }
    }

    if (task.taskRepeatPreset && task.taskRepeatPreset.length) {
      if (task.taskRepeatPreset == 'weekdays') {
        return genDate.day() != 0 && genDate.day() != 6;
      } else if (task.taskRepeatPreset == 'weekends') {
        return genDate.day() == 0 || genDate.day() == 6;
      } else if (task.taskRepeatPreset == 'weekly') {
        return newTask || Math.abs(genDate.diff(taskDate, 'days')) >= 7;
      }
    } else if (task.taskRepeatCustom && task.taskRepeatCustom != 0) {
      return newTask || Math.abs(genDate.diff(taskDate, 'days')) >= task.taskRepeatCustom;
    } else if (task.taskRepeatDays.length) {
      var day = genDate.day();
      return task.taskRepeatDays.indexOf(day) > -1;
    }
  });
  callback(null, filteredTasks);
}

function generateTasks(genDate, tasks, callback) {
  var newGenTaskPromises = tasks.map(function (task) {
    var newTask = _lodash2.default.pick(task, pickTaskDetails);
    newTask.occurrenceDate = dateUtil.standardizeDate(genDate);
    var newTaskObj = new TimelineTask(newTask);
    if (task.childTasks && task.childTasks.length) {
      return buildParentTask(newTaskObj, task);
    } else if (!task.isChildTask) {
      return newTaskObj.save();
    } else {
      console.log('child task', task);
    }
  });

  Q.all(newGenTaskPromises).then(function (newTasks) {
    callback(null, {
      newTasks: newTasks,
      templateTasks: tasks
    });
  }).catch(callback);
}

function buildParentTask(newParentTask, taskTemplate) {
  var deferred = Q.defer();
  async.waterfall([async.apply(retrieveChildren, taskTemplate.childTasks), async.apply(buildChildren, newParentTask), async.apply(saveChildrenToParent, newParentTask)], function (err, results) {
    if (err) deferred.reject(err);else {
      deferred.resolve(results);
    }
  });
  return deferred.promise;
}

function retrieveChildren(childIds, callback) {
  TimelineTask.find({
    '_id': { $in: childIds }
  }).exec(function (err, children) {
    if (err) return callback(err);else return callback(null, children);
  });
}

function buildChildren(parentTask, childrenTasks, callback) {
  var childPromises = childrenTasks.map(function (childTaskTemplate) {
    var newTask = _lodash2.default.pick(childTaskTemplate, pickTaskDetails);
    newTask.parentTask = parentTask._id;
    newTask.site = parentTask.site;
    newTask.occurrenceDate = parentTask.occurrenceDate;
    newTask.room = parentTask.room;
    newTask.childIndex = childTaskTemplate.childIndex;

    var newTaskObj = new TimelineTask(newTask);
    return newTaskObj.save();
  });

  Q.all(childPromises).then(function (newTasks) {
    var childIds = newTasks.map(function (child) {
      return child._id;
    });
    callback(null, childIds);
  }).catch(callback);
}

function saveChildrenToParent(parentTask, childTaskIds, callback) {
  parentTask.childTasks = childTaskIds;
  parentTask.save(function (err) {
    if (err) callback(err);else callback(null, parentTask);
  });
}

function updateTemplateTasks(genDate, allTasks, callback) {
  var taskTemplateIds = allTasks.templateTasks.map(function (task) {
    return task._id;
  });
  var standardDate = dateUtil.standardizeDate(genDate);
  TimelineTask.update({ _id: { $in: taskTemplateIds } }, { $set: { taskLastBuilt: standardDate } }, { multi: true, new: true }, function (err, updated) {
    callback(null, {
      updated: updated,
      newTasks: allTasks.newTasks
    });
  });
}

exports.buildRoomTasks = function (req, res) {

  var tlDetails = req.body;
  tlDetails.flippedTBD = false;
  var TBDTaskCount = 0;
  var reoccuringTaskCount = 0;
  var tlDates = tlDetails.tlDates;
  var roomLengths = findLengths(tlDates.startDate, tlDates.flippedDate, tlDates.endDate);
  if (!tlDates.flippedDate) {
    tlDetails.flippedTBD = true;
  }
  var isStandardVegLength = roomLengths.vegLength == masterPeriods['veg'].periodLength,
      isStandardFlowerLength = roomLengths.vegLength == masterPeriods['flower'].periodLength;

  TimelineTask.find({ isMaster: true }).exec(function (err, masterTasks) {
    if (err) return res.status(400).json(err);else {
      if (masterTasks.length) {
        buildTimelineTasks(masterTasks);
      } else {
        return res.status(300).json({});
      }
    }
  });

  // Create new room tasks from the master tasks
  function buildTimelineTasks(masterTasks) {
    var tlTasksPromises = masterTasks.map(function (masterTask) {
      if (masterTask.taskType == 'x-check' || masterTask.taskType == 'dailyCheck') {
        reoccuringTaskCount++;
      } else if (masterTask.occurrenceObj && masterTask.occurrenceObj.type == 'flower' && tlDetails.flippedTBD) {
        TBDTaskCount++;
      }
      return buildTask(masterTask, roomLengths.vegLength, roomLengths.flowerLength, isStandardVegLength, isStandardFlowerLength, tlDetails);
    });

    Q.all(tlTasksPromises).then(function (newTasks) {
      return res.status(200).json({
        newTasks: newTasks,
        reoccurringTaskCount: reoccuringTaskCount,
        TBDTaskCount: TBDTaskCount
      });
    }).catch(function (err) {
      return res.status(420).json(err);
    });
  }
};

exports.buildCycleTasks = function (req, res) {

  var inPeriod = req.body.inPeriod;
  var room = req.body.room;
  var fromDate = req.body.fromDate;

  TimelineTask.find({ isMaster: true, taskType: 'tunnel-timeline', inPeriod: inPeriod }).exec(function (err, masterTasks) {
    if (err) return res.status(400).json(err);else {
      if (masterTasks.length) {
        buildCycleTasks(masterTasks);
      } else {
        return res.status(300).json({});
      }
    }
  });

  // Create new room tasks from the master tasks
  function buildCycleTasks(masterTasks) {
    var tasksPromises = masterTasks.map(function (masterTask) {
      return buildCycleTask(masterTask, room, fromDate);
    });

    var roomGeneratedField;
    var today = dateUtil.standardizeDate(new Date());
    if (inPeriod === 'veg') {
      roomGeneratedField = 'generatedVegTasks';
    } else {
      roomGeneratedField = 'generatedFlowerTasks';
    }
    Q.all(tasksPromises).then(function (newTasks) {
      _room2.default.findById(room._id).exec(function (err, room) {
        room[roomGeneratedField] = today;
        room.save();
      });
      return res.status(200).json(newTasks);
    }).catch(function (err) {
      return res.status(420).json(err);
    });
  }
};
exports.generateTasksFromTimeline = function (req, res) {
  var room = req.body.room;
  var tlTemplateId = req.body.tlTemplateId;
  var fromDate = dateUtil.standardizeDate(req.body.fromDate);
  var fromDateType = req.body.fromDateType;

  TimelineTask.find({ isMaster: true,
    taskType: 'tunnel-timeline',
    taskTLTemplate: tlTemplateId
  }).exec(function (err, tlTasks) {
    if (err) return res.status(400).json(err);else {
      if (tlTasks.length) {
        buildCycleTasks(tlTasks);
      } else {
        return res.status(300).json({});
      }
    }
  });

  // Create new room tasks from the master tasks
  function buildCycleTasks(tasksToGen) {
    var newTasks = _lodash2.default.map(tasksToGen, function (t) {
      return buildCycleTaskFromTemplate(t, room, fromDate);
    });

    var buildErrors = [];

    _lodash2.default.forEach(newTasks, function (t) {
      if (t.genError) {
        buildErrors.push(t);
      }
    });

    if (buildErrors.length > 0) {
      return res.status(420).json({
        buildErrors: buildErrors
      });
    } else {
      var taskPromises = _lodash2.default.map(newTasks, function (newTaskInfo) {
        if (newTaskInfo.templateTask.childTasks && newTaskInfo.templateTask.childTasks.length > 0) {
          return buildParentTask(newTaskInfo.builtTask, newTaskInfo.templateTask);
        } else {
          if (newTaskInfo && newTaskInfo.builtTask) {
            return newTaskInfo.builtTask.save();
          }
        }
      });

      var newTaskGenerationEvent = {
        generatedDate: new Date(),
        fromTLTemplateId: tlTemplateId,
        fromDateType: fromDateType
      };
      Q.all(taskPromises).then(function (generatedTasks) {
        _room2.default.findById(room._id).exec(function (err, room) {
          room.taskGenerationEvents.push(newTaskGenerationEvent);
          room.markModified('taskGenerationEvents');
          room.save();
          var returnData = {
            newTasks: generatedTasks,
            taskGenerationEvents: room.taskGenerationEvents
          };
          return res.status(200).json(returnData);
        });
      }).catch(function (err) {
        return res.status(420).json(err);
      });
    }
  }
};

function newTask(task, roomDetails) {
  var newTaskObj = new TimelineTask(task);
  newTaskObj.forCycleStarting = roomDetails.startDate;
  newTaskObj.room = roomDetails._id;
  newTaskObj.site = roomDetails.site;
  return newTaskObj.save();
}

function findLengths(startDate, flippedDate, endDate) {
  var vegLength, flowerLength;

  if (!flippedDate) {
    vegLength = 21, flowerLength = 56;
  } else {
    vegLength = moment(flippedDate).diff(moment(startDate), 'days'), flowerLength = moment(endDate).diff(moment(flippedDate), 'days');
  }

  return {
    vegLength: vegLength,
    flowerLength: flowerLength
  };
}

function findDayWeekPeriodFromDate(vegLength, roomStart, roomFlipped, taskDate) {
  var inPeriod,
      startDate = moment(roomStart),
      flippedDate;

  if (!roomFlipped) {
    flippedDate = moment(startDate).add(3, 'weeks');
  } else {
    flippedDate = moment(roomFlipped);
  }
  var taskDay = moment(taskDate).diff(startDate, 'days');
  if (taskDay > vegLength) {
    inPeriod = 'flower';
    taskDay = moment(taskDate).diff(flippedDate, 'days');
  } else {
    inPeriod = 'veg';
  }
  taskDay += 1;
  var dayAndWeek = findDayAndWeek(taskDay);
  return {
    inPeriod: inPeriod,
    taskDay: dayAndWeek.day,
    taskWeek: dayAndWeek.week
  };
}

function buildTask(masterTask, vegLength, flowerLength, isStandardVeg, isStandardFlower, tlDetails) {
  var occurrenceObj = masterTask.occurrenceObj,
      occurrenceDay,
      dayAndWeek;
  var newTaskObj = new TimelineTask({
    title: masterTask.title,
    backgroundColor: masterTask.backgroundColor,
    warningColor: masterTask.warningColor,
    timeEstimate: masterTask.timeEstimate,
    notes: masterTask.notes,
    forCycleStarting: tlDetails.tlDates.startDate,
    priority: masterTask.priority,
    subPriority: masterTask.subPriority,
    taskRepeatCustom: masterTask.taskRepeatCustom,
    taskRepeatPreset: masterTask.taskRepeatPreset,
    room: tlDetails.room,
    site: tlDetails.site,
    inPeriod: '',
    isMaster: false,
    taskType: masterTask.taskType
  });

  if (masterTask.taskType === 'daily-check' || masterTask.taskType === 'x-check') {
    newTaskObj.checkTemplateObj = true;
    newTaskObj.saveToSite = true;
    newTaskObj.taskRepeatCustom = masterTask.taskRepeatCustom;
    newTaskObj.taskRepeatPreset = masterTask.taskRepeatPreset;
    newTaskObj.templateId = masterTask._id;
    newTaskObj.masterCheckLocation = masterTask.masterCheckLocation;
  } else {
    delete newTaskObj.saveToSite;
    if (occurrenceObj.type === 'flower' && tlDetails.flippedTBD) {
      newTaskObj.saveToRoomTBD = true;
    } else {
      var periodLength,
          isStandardPeriod = false;
      if (occurrenceObj.type == 'veg') {
        periodLength = vegLength;
        newTaskObj.inPeriod = 'veg';
        isStandardPeriod = isStandardVeg;
      } else if (occurrenceObj.type == 'flower') {
        periodLength = flowerLength;
        newTaskObj.inPeriod = 'flower';
        isStandardPeriod = isStandardFlower;
      } else return;

      if (occurrenceObj.occurrenceDay.type == 'percent' && !isStandardPeriod) {
        occurrenceDay = calculateDayFromMasterPercent(occurrenceObj.occurrenceDay.value, occurrenceObj.type, periodLength);
      } else {
        occurrenceDay = occurrenceObj.occurrenceDay.value;
      }

      dayAndWeek = findDayAndWeek(occurrenceDay), newTaskObj.taskDay = dayAndWeek.day, newTaskObj.taskWeek = dayAndWeek.week, newTaskObj.occurrenceDate = findTaskDate(newTaskObj, tlDetails.tlDates.startDate, tlDetails.tlDates.flippedDate);
    }
  }

  var deferred;
  if (newTaskObj.saveToSite) {
    deferred = Q.defer();
    SiteCtrl.shouldImportToSite(newTaskObj.site, newTaskObj).then(function () {
      newTaskObj.masterCheckLocation = null;
      newTaskObj.save(function (err) {
        if (err) deferred.reject(err);else {
          SiteCtrl.newReoccurringTask(newTaskObj).then(function (response) {
            deferred.resolve(newTaskObj);
          }).catch(function (err) {
            deferred.reject(err);
          });
        }
      });
    }).catch(function () {
      deferred.resolve();
    });

    return deferred.promise;
  } else if (newTaskObj.saveToRoomTBD) {
    deferred = Q.defer();
    _room2.default.findByIdAndUpdate(newTaskObj.room, { $push: { TBDTasks: newTaskObj } }, { 'new': true }).exec(function (err, room) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(newTaskObj);
      }
    });

    return deferred.promise;
  } else {
    return newTaskObj.save();
  }
}

function buildCycleTaskFromTemplate(templateTask, room, fromDate) {
  var occurrenceObj = templateTask.occurrenceObj,
      occurrenceDay,
      dayAndWeek;
  var genError;
  var newTaskObj = new TimelineTask({
    title: templateTask.title,
    backgroundColor: templateTask.backgroundColor,
    warningColor: templateTask.warningColor,
    timeEstimate: templateTask.timeEstimate,
    notes: templateTask.notes,
    forCycleStarting: room.startDate,
    priority: templateTask.priority,
    subPriority: templateTask.subPriority,
    taskRepeatCustom: templateTask.taskRepeatCustom,
    taskRepeatPreset: templateTask.taskRepeatPreset,
    taskRepeatDays: templateTask.taskRepeatDays,
    images: templateTask.images,
    room: room,
    site: room.siteId,
    inPeriod: templateTask.inPeriod,
    isMaster: false,
    taskType: templateTask.taskType,
    fromTLTemplate: templateTask.taskTLTemplate,
    masterTaskId: templateTask._id
  });

  try {
    occurrenceDay = occurrenceObj.occurrenceDay.value;
  } catch (e) {
    genError = {
      genTitle: "Could not determine what day this task occurs.",
      solution: "Check the master task and ensure all fields under 'Master Occurrence' have a value.",
      taskTitle: templateTask.title
    };
  }
  if (templateTask.inPeriod === 'na' || templateTask.inPeriod === 'finalize') {
    try {
      newTaskObj.taskDay = templateTask.occurrenceInfo.selectedTime.day, newTaskObj.taskWeek = templateTask.occurrenceInfo.selectedTime.week, newTaskObj.occurrenceDate = dateUtil.standardizeDate(findTaskDateFromGeneralDate(newTaskObj, fromDate));
    } catch (e) {
      if (!templateTask.occurrenceInfo || !templateTask.occurrenceInfo.selectedTime) {
        genError = {
          genTitle: "Could not determine when the task should occur, i.e., 'W1-V', 'W3-F'.",
          solution: "Edit the master task and make sure all fields under 'Master Occurrence' have a value.",
          taskTitle: templateTask.title
        };
      } else {
        genError = {
          genTitle: "Unknown error occurred.",
          solution: "Check the master task and ensure all fields under 'Master Occurrence' have a value.",
          taskTitle: templateTask.title
        };
      }
    }
  } else {
    dayAndWeek = findDayAndWeek(occurrenceDay), newTaskObj.taskDay = dayAndWeek.day, newTaskObj.taskWeek = dayAndWeek.week, newTaskObj.occurrenceDate = dateUtil.standardizeDate(findTaskDateFromGeneralDate(newTaskObj, fromDate));
  }

  return {
    genError: genError,
    builtTask: newTaskObj,
    templateTask: templateTask

    // if(templateTask.childTasks && templateTask.childTasks.length) {
    //   return buildParentTask(newTaskObj, templateTask)
    // } else return newTaskObj.save();

  };
}

function buildCycleTask(masterTask, room, fromDate) {
  var occurrenceObj = masterTask.occurrenceObj,
      occurrenceDay,
      dayAndWeek;
  var newTaskObj = new TimelineTask({
    title: masterTask.title,
    backgroundColor: masterTask.backgroundColor,
    warningColor: masterTask.warningColor,
    timeEstimate: masterTask.timeEstimate,
    notes: masterTask.notes,
    forCycleStarting: room.startDate,
    priority: masterTask.priority,
    subPriority: masterTask.subPriority,
    taskRepeatCustom: masterTask.taskRepeatCustom,
    taskRepeatPreset: masterTask.taskRepeatPreset,
    room: room,
    site: room.siteId,
    inPeriod: masterTask.inPeriod,
    isMaster: false,
    taskType: masterTask.taskType
  });

  occurrenceDay = occurrenceObj.occurrenceDay.value;

  dayAndWeek = findDayAndWeek(occurrenceDay), newTaskObj.taskDay = dayAndWeek.day, newTaskObj.taskWeek = dayAndWeek.week, newTaskObj.occurrenceDate = dateUtil.standardizeDate(findTaskDateFromGeneralDate(newTaskObj, fromDate));

  if (masterTask.childTasks && masterTask.childTasks.length) {
    return buildParentTask(newTaskObj, masterTask);
  } else return newTaskObj.save();
}

function calculateDayFromMasterPercent(masterDay, period, periodLength) {
  var masterPeriodLength = masterPeriods[period].periodLength,
      percentThroughMasterPeriod = masterDay / masterPeriodLength;
  return Math.ceil(percentThroughMasterPeriod * periodLength);
}

function findDayAndWeek(day) {
  var dayAndWeek = {
    day: null,
    week: null
  };
  if (day > 7) {
    dayAndWeek.week = Math.ceil(day / 7);
    dayAndWeek.day = Math.round(day % 7);
    if (!dayAndWeek.day) {
      dayAndWeek.day = 7;
    }
  } else {
    dayAndWeek = {
      day: day,
      week: 1
    };
  }

  return dayAndWeek;
}

function findTaskDate(task, startDate, flippedDate) {
  var weekMultiplier = task.taskWeek - 1;
  var dayInPeriod = weekMultiplier * 7 + (task.taskDay - 1);
  var periodStartDate, taskDate;
  if (task.inPeriod === 'flower' && !flippedDate) {
    periodStartDate = moment(startDate).add(3, 'weeks');
  } else if (task.inPeriod == 'flower' && flippedDate) {
    periodStartDate = moment(flippedDate);
  } else periodStartDate = moment(startDate);

  taskDate = periodStartDate.add(dayInPeriod, 'days');
  return taskDate;
}

function findTaskDateFromGeneralDate(task, fromDate) {
  var weekMultiplier = task.taskWeek - 1;
  var dayInPeriod = weekMultiplier * 7 + (task.taskDay - 1);
  var startDate = moment(fromDate);
  return startDate.add(dayInPeriod, 'days');;
}
//# sourceMappingURL=timelineTask.controller.js.map
