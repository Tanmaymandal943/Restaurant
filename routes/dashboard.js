const path = require('path');
const express = require('express');

const dashboardCon = require('../controllers/dashboard');

const router = express.Router();

router.get('/',dashboardCon.get_dashboard);
router.post('/',dashboardCon.post_dashboard);
router.post('/bill_paid',dashboardCon.post_dashboard_bill_paid);
router.post('/table_assigned',dashboardCon.post_dashboard_table_assigned);
router.post('/reservation_success', dashboardCon.post_dashboard_reservation_success);
router.post('/waitlist_success', dashboardCon.post_dashboard_waitlist_success);
router.post('/modify_cust_success', dashboardCon.post_dashboard_modify_cust_success);
router.post('/send_order',dashboardCon.post_dashboard_send_order);
router.post('/order_prepared',dashboardCon.post_dashboard_order_prepared);
router.post('/request_ingredient',dashboardCon.post_dashboard_request_ingredient);
router.post('/request_misc',dashboardCon.post_dashboard_request_misc);
router.post('/request_item',dashboardCon.post_dashboard_request_item);

module.exports = router;
