/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/masterTimeline              ->  index
 * POST    /api/masterTimeline              ->  create
 * GET     /api/masterTimeline/:id          ->  show
 * PUT     /api/masterTimeline/:id          ->  update
 * DELETE  /api/masterTimeline/:id          ->  destroy
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
exports.getAllMasterTasks = getAllMasterTasks;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _masterTimelineTask = require('./../../models/masterTimelineTask.model');

var _masterTimelineTask2 = _interopRequireDefault(_masterTimelineTask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RoomTimelineCtrl = require('./../roomTimeline/roomTimeline.controller');
var TimelineTaskCtrl = require('./../timelineTask/timelineTask.controller');
var async = require('async');

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

// Gets a list of MasterTimelines
function index(req, res) {
  return _masterTimelineTask2.default.find().exec().then(respondWithResult(res)).catch(handleError(res));
}

// Gets a single MasterTimeline from the DB
function show(req, res) {
  return _masterTimelineTask2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
}

// Creates a new MasterTimeline in the DB
function create(req, res) {
  return _masterTimelineTask2.default.create(req.body).then(respondWithResult(res, 201)).catch(handleError(res));
}

// Updates an existing MasterTimeline in the DB
function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  _masterTimelineTask2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(saveUpdates(req.body)).then(function (updated) {
    return res.status(200).json(updated);
  });
}

// Deletes a MasterTimeline from the DB
function destroy(req, res) {
  return _masterTimelineTask2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}

function getAllMasterTasks() {
  return _masterTimelineTask2.default.find({});
}
//# sourceMappingURL=masterTimeline.controller.js.map
