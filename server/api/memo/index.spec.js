'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var memoCtrlStub = {
  index: 'memoCtrl.index',
  show: 'memoCtrl.show',
  create: 'memoCtrl.create',
  update: 'memoCtrl.update',
  destroy: 'memoCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var memoIndex = proxyquire('./index.js', {
  'express': {
    Router: function Router() {
      return routerStub;
    }
  },
  './memo.controller': memoCtrlStub
});

describe('Memo API Router:', function () {

  it('should return an express router instance', function () {
    memoIndex.should.equal(routerStub);
  });

  describe('GET /api/memos', function () {

    it('should route to memo.controller.index', function () {
      routerStub.get.withArgs('/', 'memoCtrl.index').should.have.been.calledOnce;
    });
  });

  describe('GET /api/memos/:id', function () {

    it('should route to memo.controller.show', function () {
      routerStub.get.withArgs('/:id', 'memoCtrl.show').should.have.been.calledOnce;
    });
  });

  describe('POST /api/memos', function () {

    it('should route to memo.controller.create', function () {
      routerStub.post.withArgs('/', 'memoCtrl.create').should.have.been.calledOnce;
    });
  });

  describe('PUT /api/memos/:id', function () {

    it('should route to memo.controller.update', function () {
      routerStub.put.withArgs('/:id', 'memoCtrl.update').should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/memos/:id', function () {

    it('should route to memo.controller.update', function () {
      routerStub.patch.withArgs('/:id', 'memoCtrl.update').should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/memos/:id', function () {

    it('should route to memo.controller.destroy', function () {
      routerStub.delete.withArgs('/:id', 'memoCtrl.destroy').should.have.been.calledOnce;
    });
  });
});
//# sourceMappingURL=index.spec.js.map
