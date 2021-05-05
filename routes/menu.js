const path = require('path');
const express = require('express');

const menuCon = require('../controllers/menu');

const router = express.Router();

router.get('/',menuCon.get_menu);
// router.post('/',defaultCon.post_default);


module.exports = router;
