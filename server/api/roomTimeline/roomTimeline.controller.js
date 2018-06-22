/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/roomTimelines              ->  index
 * POST    /api/roomTimelines              ->  create
 * GET     /api/roomTimelines/:id          ->  show
 * PUT     /api/roomTimelines/:id          ->  update
 * DELETE  /api/roomTimelines/:id          ->  destroy
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.index = index;
exports.show = show;
exports.create = create;
exports.update = update;
exports.destroy = destroy;
exports.roomTimelineExists = roomTimelineExists;
exports.newRoomTimeline = newRoomTimeline;
exports.getActiveRoomTimelines = getActiveRoomTimelines;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _roomTimelineModel = require('./../../models/roomTimeline.model.js');

var _roomTimelineModel2 = _interopRequireDefault(_roomTimelineModel);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//var Room = mongoose.model('Room');
var Q = require('q');

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
    var updated = _lodash2.default.merge(entity, updates);
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

// Gets a list of RoomTimelines
function index(req, res) {
  return _roomTimelineModel2.default.find().exec().then(respondWithResult(res)).catch(handleError(res));
}

// Gets a single RoomTimeline from the DB
function show(req, res) {
  return _roomTimelineModel2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
}

// Creates a new RoomTimeline in the DB
function create(req, res) {
  return _roomTimelineModel2.default.create(req.body).then(respondWithResult(res, 201)).catch(handleError(res));
}

// Updates an existing RoomTimeline in the DB
function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return _roomTimelineModel2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(saveUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

// Deletes a RoomTimeline from the DB
function destroy(req, res) {
  return _roomTimelineModel2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}

function roomTimelineExists(room, site, startDate) {
  var deferred = Q.defer();
  _roomTimelineModel2.default.findOne({ room: room,
    site: site,
    forCycleStarting: startDate }).exec(function (err, timeline) {
    if (err) deferred.reject(err);
    if (timeline) {
      var errorMessage = 'A timeline already exists for this room and start date.';
      if (timeline.tlName) errorMessage = errorMessage + ' It is titled ' + timeline.tlName + '.';
      deferred.reject({ errorMessage: errorMessage });
    }
    if (!timeline) deferred.resolve();
  });
  return deferred.promise;
}

function newRoomTimeline(tlDetails, tlTasks, startDate) {
  var roomTimeline = new _roomTimelineModel2.default({
    timelineTasks: tlTasks,
    room: tlDetails.room,
    site: tlDetails.site,
    forCycleStarting: startDate,
    tlName: tlDetails.tlName
  });

  return roomTimeline.save();
}

function getActiveRoomTimelines(callback) {
  //Room.find(
  //  {timelines : {$exists: true, $not:{$size: 0}}}
  //)
  //.exec(function(err, rooms) {
  //  if(err) return callback(err);
  //  else {
  //    var roomTimelines = rooms.map(room => {
  //      var timelines = room.timelines;
  //      return {
  //        timelines : timelines.filter(timeline => {
  //          return new Date(timeline.forCycleStarting) >= new Date(room.startDate);
  //        }),
  //        startDate : room.startDate,
  //        endDate : room.endDate,
  //        flippedDate : room.flippedDate,
  //        roomId : room._id
  //      }
  //    })
  //
  //    return callback(null, roomTimelines);
  //  }
  //})
}
//# sourceMappingURL=roomTimeline.controller.js.map
