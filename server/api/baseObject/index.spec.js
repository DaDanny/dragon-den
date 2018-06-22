'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var baseObjectCtrlStub = {
  index: 'baseObjectCtrl.index',
  show: 'baseObjectCtrl.show',
  create: 'baseObjectCtrl.create',
  update: 'baseObjectCtrl.update',
  destroy: 'baseObjectCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var baseObjectIndex = proxyquire('./index.js', {
  'express': {
    Router: function Router() {
      return routerStub;
    }
  },
  './baseObject.controller': baseObjectCtrlStub
});

describe('BaseObject API Router:', function () {

  it('should return an express router instance', function () {
    baseObjectIndex.should.equal(routerStub);
  });

  describe('GET /api/baseObject', function () {

    it('should route to baseObject.controller.index', function () {
      routerStub.get.withArgs('/', 'baseObjectCtrl.index').should.have.been.calledOnce;
    });
  });

  describe('GET /api/baseObject/:id', function () {

    it('should route to baseObject.controller.show', function () {
      routerStub.get.withArgs('/:id', 'baseObjectCtrl.show').should.have.been.calledOnce;
    });
  });

  describe('POST /api/baseObject', function () {

    it('should route to baseObject.controller.create', function () {
      routerStub.post.withArgs('/', 'baseObjectCtrl.create').should.have.been.calledOnce;
    });
  });

  describe('PUT /api/baseObject/:id', function () {

    it('should route to baseObject.controller.update', function () {
      routerStub.put.withArgs('/:id', 'baseObjectCtrl.update').should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/baseObject/:id', function () {

    it('should route to baseObject.controller.update', function () {
      routerStub.patch.withArgs('/:id', 'baseObjectCtrl.update').should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/baseObject/:id', function () {

    it('should route to baseObject.controller.destroy', function () {
      routerStub.delete.withArgs('/:id', 'baseObjectCtrl.destroy').should.have.been.calledOnce;
    });
  });
});
//# sourceMappingURL=index.spec.js.map
