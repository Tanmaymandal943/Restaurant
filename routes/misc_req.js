const path = require('path');
const express = require('express');

const misc_reqCon = require('../controllers/misc_req');

const router = express.Router();

router.get('/',misc_reqCon.get_menu);
// router.post('/',defaultCon.post_default);


module.exports = router;
