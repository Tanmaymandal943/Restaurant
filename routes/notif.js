const path = require('path');
const express = require('express');

const notifCon = require('../controllers/notif');

const router = express.Router();

router.get('/',notifCon.get_notif);
// router.post('/',defaultCon.post_default);


module.exports = router;
