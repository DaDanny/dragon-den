/**
 * Created by Danny on 7/13/16.
 */
'use strict';

var express = require('express');
var controller = require('./site.controller');
var router = express.Router();

router.get('/', controller.index);

module.exports = router;
//# sourceMappingURL=index.js.map
