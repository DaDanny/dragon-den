/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/memos              ->  index
 * POST    /api/memos              ->  create
 * GET     /api/memos/:id          ->  show
 * PUT     /api/memos/:id          ->  update
 * DELETE  /api/memos/:id          ->  destroy
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

var _memo = require('../../models/memo.model');

var _memo2 = _interopRequireDefault(_memo);

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
    res.status(statusCode).send(err);
  };
}

// Gets a list of Memos
function index(req, res) {
  return _memo2.default.find({
    memoType: 'parent-memo'
  }).populate('childMemos parentMemo').exec().then(respondWithResult(res)).catch(handleError(res));
}

// Gets a single Memo from the DB
function show(req, res) {
  return _memo2.default.findById(req.params.id).populate('childMemos parentMemo').exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
}

// Creates a new Memo in the DB
function create(req, res) {
  return _memo2.default.create(req.body).then(respondWithResult(res, 201)).catch(handleError(res));
}

// Updates an existing Memo in the DB
function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return _memo2.default.findById(req.params.id).populate('childMemos parentMemo').exec().then(handleEntityNotFound(res)).then(saveUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

// Deletes a Memo from the DB
function destroy(req, res) {
  return _memo2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}
//# sourceMappingURL=memo.controller.js.map
