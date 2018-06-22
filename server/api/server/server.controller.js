/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/server              ->  index
 * POST    /api/server              ->  create
 * GET     /api/server/:id          ->  show
 * PUT     /api/server/:id          ->  update
 * DELETE  /api/server/:id          ->  destroy
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
exports.onlineCheck = onlineCheck;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _server = require('./server.model');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

// Gets a list of Servers
function index(req, res) {
  return _server2.default.find().exec().then(respondWithResult(res)).catch(handleError(res));
}

// Gets a single Server from the DB
function show(req, res) {
  return _server2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
}

// Creates a new Server in the DB
function create(req, res) {
  return _server2.default.create(req.body).then(respondWithResult(res, 201)).catch(handleError(res));
}

// Updates an existing Server in the DB
function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return _server2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(saveUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

// Deletes a Server from the DB
function destroy(req, res) {
  return _server2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}

function onlineCheck(req, res) {
  return res.status(200).json({});
}
//# sourceMappingURL=server.controller.js.map
