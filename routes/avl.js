const path = require('path');
const express = require('express');

const avlCon = require('../controllers/avl');

const router = express.Router();

router.get('/',avlCon.get_avl);
// router.post('/',defaultCon.post_default);


module.exports = router;
