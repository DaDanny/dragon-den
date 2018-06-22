'use strict';

var _supertest = require('supertest');

var _supertest2 = _interopRequireDefault(_supertest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = require('../..');


var newMemo;

describe('Memo API:', function () {

  describe('GET /api/memos', function () {
    var memos;

    beforeEach(function (done) {
      (0, _supertest2.default)(app).get('/api/memos').expect(200).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        memos = res.body;
        done();
      });
    });

    it('should respond with JSON array', function () {
      memos.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/memos', function () {
    beforeEach(function (done) {
      (0, _supertest2.default)(app).post('/api/memos').send({
        name: 'New Memo',
        info: 'This is the brand new memo!!!'
      }).expect(201).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        newMemo = res.body;
        done();
      });
    });

    it('should respond with the newly created memo', function () {
      newMemo.name.should.equal('New Memo');
      newMemo.info.should.equal('This is the brand new memo!!!');
    });
  });

  describe('GET /api/memos/:id', function () {
    var memo;

    beforeEach(function (done) {
      (0, _supertest2.default)(app).get('/api/memos/' + newMemo._id).expect(200).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        memo = res.body;
        done();
      });
    });

    afterEach(function () {
      memo = {};
    });

    it('should respond with the requested memo', function () {
      memo.name.should.equal('New Memo');
      memo.info.should.equal('This is the brand new memo!!!');
    });
  });

  describe('PUT /api/memos/:id', function () {
    var updatedMemo;

    beforeEach(function (done) {
      (0, _supertest2.default)(app).put('/api/memos/' + newMemo._id).send({
        name: 'Updated Memo',
        info: 'This is the updated memo!!!'
      }).expect(200).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        updatedMemo = res.body;
        done();
      });
    });

    afterEach(function () {
      updatedMemo = {};
    });

    it('should respond with the updated memo', function () {
      updatedMemo.name.should.equal('Updated Memo');
      updatedMemo.info.should.equal('This is the updated memo!!!');
    });
  });

  describe('DELETE /api/memos/:id', function () {

    it('should respond with 204 on successful removal', function (done) {
      (0, _supertest2.default)(app).delete('/api/memos/' + newMemo._id).expect(204).end(function (err, res) {
        if (err) {
          return done(err);
        }
        done();
      });
    });

    it('should respond with 404 when memo does not exist', function (done) {
      (0, _supertest2.default)(app).delete('/api/memos/' + newMemo._id).expect(404).end(function (err, res) {
        if (err) {
          return done(err);
        }
        done();
      });
    });
  });
});
//# sourceMappingURL=memo.integration.js.map
