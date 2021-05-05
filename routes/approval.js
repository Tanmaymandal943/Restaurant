const path = require('path');
const express = require('express');

const approvalCon = require('../controllers/approval');

const router = express.Router();

router.get('/',approvalCon.get_default);
// router.post('/',dateresCon.post_default);


module.exports = router;
