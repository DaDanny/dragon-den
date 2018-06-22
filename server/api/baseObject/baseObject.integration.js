'use strict';

var _supertest = require('supertest');

var _supertest2 = _interopRequireDefault(_supertest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = require('../..');


var newBaseObject;

describe('BaseObject API:', function () {

  describe('GET /api/baseObject', function () {
    var baseObjects;

    beforeEach(function (done) {
      (0, _supertest2.default)(app).get('/api/baseObject').expect(200).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        baseObjects = res.body;
        done();
      });
    });

    it('should respond with JSON array', function () {
      baseObjects.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/baseObject', function () {
    beforeEach(function (done) {
      (0, _supertest2.default)(app).post('/api/baseObject').send({
        name: 'New BaseObject',
        info: 'This is the brand new baseObject!!!'
      }).expect(201).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        newBaseObject = res.body;
        done();
      });
    });

    it('should respond with the newly created baseObject', function () {
      newBaseObject.name.should.equal('New BaseObject');
      newBaseObject.info.should.equal('This is the brand new baseObject!!!');
    });
  });

  describe('GET /api/baseObject/:id', function () {
    var baseObject;

    beforeEach(function (done) {
      (0, _supertest2.default)(app).get('/api/baseObject/' + newBaseObject._id).expect(200).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        baseObject = res.body;
        done();
      });
    });

    afterEach(function () {
      baseObject = {};
    });

    it('should respond with the requested baseObject', function () {
      baseObject.name.should.equal('New BaseObject');
      baseObject.info.should.equal('This is the brand new baseObject!!!');
    });
  });

  describe('PUT /api/baseObject/:id', function () {
    var updatedBaseObject;

    beforeEach(function (done) {
      (0, _supertest2.default)(app).put('/api/baseObject/' + newBaseObject._id).send({
        name: 'Updated BaseObject',
        info: 'This is the updated baseObject!!!'
      }).expect(200).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        updatedBaseObject = res.body;
        done();
      });
    });

    afterEach(function () {
      updatedBaseObject = {};
    });

    it('should respond with the updated baseObject', function () {
      updatedBaseObject.name.should.equal('Updated BaseObject');
      updatedBaseObject.info.should.equal('This is the updated baseObject!!!');
    });
  });

  describe('DELETE /api/baseObject/:id', function () {

    it('should respond with 204 on successful removal', function (done) {
      (0, _supertest2.default)(app).delete('/api/baseObject/' + newBaseObject._id).expect(204).end(function (err, res) {
        if (err) {
          return done(err);
        }
        done();
      });
    });

    it('should respond with 404 when baseObject does not exist', function (done) {
      (0, _supertest2.default)(app).delete('/api/baseObject/' + newBaseObject._id).expect(404).end(function (err, res) {
        if (err) {
          return done(err);
        }
        done();
      });
    });
  });
});
//# sourceMappingURL=baseObject.integration.js.map
