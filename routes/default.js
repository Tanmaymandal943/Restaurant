const path = require('path');
const express = require('express');

const defaultCon = require('../controllers/default');

const router = express.Router();

router.get('/',defaultCon.get_default);
router.post('/',defaultCon.post_default);
router.post('/logout',defaultCon.post_logout);
router.get('/profile',defaultCon.get_profile);

module.exports = router;
