'use strict';

var _supertest = require('supertest');

var _supertest2 = _interopRequireDefault(_supertest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = require('../..');


var newServer;

describe('Server API:', function () {

  describe('GET /api/server', function () {
    var servers;

    beforeEach(function (done) {
      (0, _supertest2.default)(app).get('/api/server').expect(200).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        servers = res.body;
        done();
      });
    });

    it('should respond with JSON array', function () {
      servers.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/server', function () {
    beforeEach(function (done) {
      (0, _supertest2.default)(app).post('/api/server').send({
        name: 'New Server',
        info: 'This is the brand new server!!!'
      }).expect(201).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        newServer = res.body;
        done();
      });
    });

    it('should respond with the newly created server', function () {
      newServer.name.should.equal('New Server');
      newServer.info.should.equal('This is the brand new server!!!');
    });
  });

  describe('GET /api/server/:id', function () {
    var server;

    beforeEach(function (done) {
      (0, _supertest2.default)(app).get('/api/server/' + newServer._id).expect(200).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        server = res.body;
        done();
      });
    });

    afterEach(function () {
      server = {};
    });

    it('should respond with the requested server', function () {
      server.name.should.equal('New Server');
      server.info.should.equal('This is the brand new server!!!');
    });
  });

  describe('PUT /api/server/:id', function () {
    var updatedServer;

    beforeEach(function (done) {
      (0, _supertest2.default)(app).put('/api/server/' + newServer._id).send({
        name: 'Updated Server',
        info: 'This is the updated server!!!'
      }).expect(200).expect('Content-Type', /json/).end(function (err, res) {
        if (err) {
          return done(err);
        }
        updatedServer = res.body;
        done();
      });
    });

    afterEach(function () {
      updatedServer = {};
    });

    it('should respond with the updated server', function () {
      updatedServer.name.should.equal('Updated Server');
      updatedServer.info.should.equal('This is the updated server!!!');
    });
  });

  describe('DELETE /api/server/:id', function () {

    it('should respond with 204 on successful removal', function (done) {
      (0, _supertest2.default)(app).delete('/api/server/' + newServer._id).expect(204).end(function (err, res) {
        if (err) {
          return done(err);
        }
        done();
      });
    });

    it('should respond with 404 when server does not exist', function (done) {
      (0, _supertest2.default)(app).delete('/api/server/' + newServer._id).expect(404).end(function (err, res) {
        if (err) {
          return done(err);
        }
        done();
      });
    });
  });
});
//# sourceMappingURL=server.integration.js.map
