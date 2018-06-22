'use strict';

var _auth = require('../../auth/auth.service');

var auth = _interopRequireWildcard(_auth);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var express = require('express');
var controller = require('./timelineTask.controller');

var router = express.Router();

router.get('/', controller.index);
router.post('/buildRoomTasks', controller.buildRoomTasks);
router.post('/generateTasksFromTimeline', controller.generateTasksFromTimeline);
router.post('/buildCycleTasks', controller.buildCycleTasks);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.post('/timelineQuery', controller.timelineQuery);
router.post('/newReoccurringTask', controller.newReoccurringTask);
router.post('/bulkUpdate', controller.bulkUpdate);
router.post('/checkTLDates', controller.checkTLDates);
router.post('/bulkDelete', controller.bulkTaskDelete);
router.post('/restoreTask/:id', controller.restoreTask);
router.post('/reoccurringTest', controller.reoccurringTest);
router.post('/timelines/copyToTimelines', controller.copyToTimelines);
router.post('/timelines/newTimeline', controller.createNewTimeline);
router.post('/timelines/updateTimeline/:id', controller.updateTimeline);
router.get('/timelines/getAllTimelines', controller.getAllTimelines);
router.delete('/timelines/:id', controller.deleteTimeline);
router.post('/timelines/copyMasterTL', controller.copyMasterTL);

module.exports = router;
//# sourceMappingURL=index.js.map
