/**
 * Created by Danny on 7/13/16.
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.index = index;
exports.newReoccurringTask = newReoccurringTask;
exports.getReoccurringTasks = getReoccurringTasks;
exports.restoreReoccurringTask = restoreReoccurringTask;
exports.getAllReoccurringTasks = getAllReoccurringTasks;
exports.shouldImportToSite = shouldImportToSite;

var _site = require('./../../models/site.model');

var _site2 = _interopRequireDefault(_site);

var _userTask = require('./../../models/userTask.model');

var _userTask2 = _interopRequireDefault(_userTask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');

var CronJob = require('cron').CronJob;
var Utils = require('../../components/Utils');
var async = require('async');
var Q = require('q');
var _ = require('lodash');

//new CronJob('00 01 17 * * 0-6', function() {
//  console.log('Test Time!');
//}, null, true, null);
//new CronJob('10 * * * * 0-6', function() {
//  console.log('generate!');
//  generateTasks();
//}, null, true, null);

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
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
    return res.status(statusCode).send(err);
  };
}

function index(req, res) {
  return _site2.default.find().exec().then(respondWithResult(res)).catch(handleError(res));
}

function newReoccurringTask(task) {
  var deferred = Q.defer();
  _site2.default.findByIdAndUpdate(task.site, { '$push': { reoccurringTasks: task._id } }, { 'new': true }).exec(function (err, site) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(site);
    }
  });
  return deferred.promise;
}

function getReoccurringTasks(siteId, callback) {
  _site2.default.findById(siteId, 'reoccurringTasks', function (err, site) {
    if (err) callback(err);else if (!site) callback({});else {
      _site2.default.populate(site, 'reoccurringTasks', function (err) {
        if (err) callback(err);else callback(null, site.reoccurringTasks);
      });
    }
  });
}

function restoreReoccurringTask(taskId, siteId) {
  var deferred = Q.defer();
  _site2.default.findById(siteId, 'reoccurringTasks', function (err, site) {
    if (err) return deferred.reject(err);else if (!site) return deferred.reject();else {
      var taskIndex = _.indexOf(site.reoccurringTasks, taskId);
      if (taskIndex === -1) {
        site.reoccurringTasks.push(taskId);
        site.markModified('reoccurringTasks');
        site.save(function (err) {
          if (err) return deferred.reject(err);else return deferred.resolve();
        });
      } else {
        return deferred.resolve();
      }
    }
  });

  return deferred.promise;
}

function getAllReoccurringTasks(callback) {
  _site2.default.find({}, 'reoccurringTasks', function (err, sites) {
    if (err) callback(err);else if (!sites) callback({});else {
      _site2.default.populate(sites, 'reoccurringTasks', function (err) {
        if (err) callback(err);else callback(null, sites);
      });
    }
  });
}

function shouldImportToSite(site, reoccurringTask) {
  var deferred = Q.defer();
  _site2.default.findById(site, 'reoccurringTasks', function (err, site) {
    if (err) deferred.reject(err);else if (!site) deferred.reject();else {
      _site2.default.populate(site, 'reoccurringTasks', function (err) {
        if (err) callback(err);else {
          var reTasks = site.reoccurringTasks;
          var tasksLen = reTasks.length;
          var foundTask = false;
          for (var t = 0; t < tasksLen; t++) {
            if (String(reTasks[t].templateId) == String(reoccurringTask.templateId)) {
              if (reoccurringTask.masterCheckLocation == 'operation') {
                foundTask = true;
                break;
              } else if (reoccurringTask.masterCheckLocation == 'room') {

                if (reTasks[t].room == reoccurringTask.room) {
                  foundTask = true;
                  break;
                }
              }
            }
          }
          if (foundTask) deferred.reject();else deferred.resolve();
        }
      });
    }
  });

  return deferred.promise;
}

function generateTasks() {
  _site2.default.find().exec().then(function (sites) {
    for (var s = 0; s < sites.length; s++) {
      async.map(sites[s].rooms, getRoomTasks, function (err, roomTasks) {
        // Results is an array of tasks for each room
        //for(var r=0;r<roomTasks.length;r++) {
        //  for(var t=0;t<roomTasks[r].length;t++) {
        //    if(!containsTask(sites[s].tasksToday, roomTasks[r][t])){
        //      sites[s].tasksToday.push(roomTasks[r][t])
        //      sites[s].save();
        //    }
        //  }
        //}

        var allRoomTasks = [];
        for (var r = 0; r < roomTasks.length; r++) {
          console.log('task count: ', roomTasks[r].length);
          console.log('task: ', roomTasks[r]);
          allRoomTasks = allRoomTasks.concat(roomTasks[r]);

          //if(roomTasks[r].length == 1) {
          //  allRoomTasks.push(roomTasks[r]);
          //} else{
          //}
        }

        console.log('allRoom: ', allRoomTasks.length);
        for (var t = 0; t < allRoomTasks.length; t++) {
          var taskIndex = findTask(sites[s].tasksToday, allRoomTasks[t]);
          console.log('index: ', taskIndex);
          if (taskIndex == -1) {
            sites[s].tasksToday.push(allRoomTasks[t]);
          } else {
            sites[s].tasksToday[taskIndex].priority = 'important';
            sites[s].markModified('tasksToday');
          }
        }
      });
      if (sites[s].isModified('tasksToday')) {
        console.log('modified!');
        sites[s].save();
      } else {

        console.log('not modified!');
      }
    }
    return null;
  }).catch(function (err) {
    console.log('err: ', err);
    return null;
  });
}

function findTask(currentTasks, newTask) {
  for (var i = 0; i < currentTasks.length; i++) {
    if (currentTasks[i].task.equals(newTask.task)) {
      console.log('contains!');
      return i;
    }
  }
  return -1;
}

function getRoomTasks(room, callback) {
  var tasksToday = [],
      roomTasks = room.tasks;
  var today = new Date();

  // Iterate through each task in the room, adding tasks that occur on this day
  for (var t = 0; t < roomTasks.length; t++) {
    var userTask;
    if (roomTasks[t].schedule == 'daily') {
      userTask = new _userTask2.default({
        task: roomTasks[t]._id,
        status: 'needed',
        priority: 'normal'
      });
      userTask.save(function (err) {
        if (err) return callback(err);
      });
      tasksToday.push(userTask);
    } else if (roomTasks[t].schedule == 'date') {
      if (Utils.sameDay(roomTasks[t].scheduleDate, today)) {
        userTask = new _userTask2.default({
          task: roomTasks[t]._id,
          status: 'needed',
          priority: 'normal'
        });
        userTask.save(function (err) {
          if (err) return callback(err);
        });
        tasksToday.push(userTask);
      }
    }
  }
  callback(null, tasksToday);
}
//# sourceMappingURL=site.controller.js.map
