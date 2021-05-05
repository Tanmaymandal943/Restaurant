const path = require('path');
const express = require('express');

const dateresCon = require('../controllers/dateres');

const router = express.Router();

router.get('/',dateresCon.get_default);
// router.post('/',dateresCon.post_default);


module.exports = router;
