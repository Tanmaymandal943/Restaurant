const path = require('path');
const express = require('express');

const resnotifCon = require('../controllers/resnotif');

const router = express.Router();

router.get('/',resnotifCon.get_resnotif);
// router.post('/',defaultCon.post_default);


module.exports = router;
