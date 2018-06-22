/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/baseObject              ->  index
 * POST    /api/baseObject              ->  create
 * GET     /api/baseObject/:id          ->  show
 * PUT     /api/baseObject/:id          ->  update
 * DELETE  /api/baseObject/:id          ->  destroy
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

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _site = require('./../../models/site.model');

var _site2 = _interopRequireDefault(_site);

var _room = require('./../../models/room.model');

var _room2 = _interopRequireDefault(_room);

var _base = require('./../../models/base.model');

var _base2 = _interopRequireDefault(_base);

var _task = require('./../../models/task.model');

var _task2 = _interopRequireDefault(_task);

var _userTask = require('./../../models/userTask.model');

var _userTask2 = _interopRequireDefault(_userTask);

var _timelineTask = require('./../../models/timelineTask.model');

var _timelineTask2 = _interopRequireDefault(_timelineTask);

var _whiteboard = require('./../../models/whiteboard.model');

var _whiteboard2 = _interopRequireDefault(_whiteboard);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');
var Utils = require('../../components/Utils');

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
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
        return res.status(204).end();
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
    return res.status(statusCode).send(err);
  };
}

function getCollection(model) {
  var collectionObj = {
    'site': _site2.default,
    'room': _room2.default,
    'task': _task2.default,
    'userTask': _userTask2.default,
    'timelineTask': _timelineTask2.default,
    'whiteboard': _whiteboard2.default,
    undefined: _base2.default
  };
  return collectionObj[model];
}

// Gets a list of BaseObjects
function index(req, res) {
  var Collection = getCollection(req.params.model);
  if (req.params.model === 'site' && req.headers.appversion) {
    var compareVersions = Utils.compareVersions(req.headers.appversion, "1.1.7");
    var query;
    if (compareVersions < 0) {
      query = {
        isNonGrow: { $ne: true }
      };
    }
    return Collection.find(query).exec().then(respondWithResult(res)).catch(handleError(res));
  } else {
    return Collection.find().exec().then(respondWithResult(res)).catch(handleError(res));
  }
}

// Gets a single BaseObject from the DB
function show(req, res) {
  var Collection = getCollection(req.params.model);
  return Collection.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
}

// Creates a new BaseObject in the DB
function create(req, res) {
  var Collection = getCollection(req.params.model);
  console.log('req: ', req.body);
  return Collection.create(req.body).then(respondWithResult(res, 201)).catch(handleError(res));
}

// Updates an existing BaseObject in the DB
function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  var Collection = getCollection(req.params.model);
  return Collection.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(saveUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

// Deletes a BaseObject from the DB
function destroy(req, res) {
  var Collection = getCollection(req.params.model);
  return Collection.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}
//# sourceMappingURL=baseObject.controller.js.map
