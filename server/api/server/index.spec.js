'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var serverCtrlStub = {
  index: 'serverCtrl.index',
  show: 'serverCtrl.show',
  create: 'serverCtrl.create',
  update: 'serverCtrl.update',
  destroy: 'serverCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var serverIndex = proxyquire('./index.js', {
  'express': {
    Router: function Router() {
      return routerStub;
    }
  },
  './server.controller': serverCtrlStub
});

describe('Server API Router:', function () {

  it('should return an express router instance', function () {
    serverIndex.should.equal(routerStub);
  });

  describe('GET /api/server', function () {

    it('should route to server.controller.index', function () {
      routerStub.get.withArgs('/', 'serverCtrl.index').should.have.been.calledOnce;
    });
  });

  describe('GET /api/server/:id', function () {

    it('should route to server.controller.show', function () {
      routerStub.get.withArgs('/:id', 'serverCtrl.show').should.have.been.calledOnce;
    });
  });

  describe('POST /api/server', function () {

    it('should route to server.controller.create', function () {
      routerStub.post.withArgs('/', 'serverCtrl.create').should.have.been.calledOnce;
    });
  });

  describe('PUT /api/server/:id', function () {

    it('should route to server.controller.update', function () {
      routerStub.put.withArgs('/:id', 'serverCtrl.update').should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/server/:id', function () {

    it('should route to server.controller.update', function () {
      routerStub.patch.withArgs('/:id', 'serverCtrl.update').should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/server/:id', function () {

    it('should route to server.controller.destroy', function () {
      routerStub.delete.withArgs('/:id', 'serverCtrl.destroy').should.have.been.calledOnce;
    });
  });
});
//# sourceMappingURL=index.spec.js.map
