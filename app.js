const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

const defaultRo = require('./routes/default');
const dashboardRo = require('./routes/dashboard');
const dateresRo = require('./routes/dateres');
const menuRo = require('./routes/menu');
const notifRo = require('./routes/notif');
const approvalRo = require('./routes/approval')
const avlRo = require('./routes/avl');
const resnotifRo = require('./routes/resnotif');
const pool =  require('./utils/database');

// const prodRoute = require('./routes/prods');
// const cartRoute = require('./routes/cart');
// const ordersRoute = require('./routes/orders');

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended:true}));
app.use(express.static(path.join(__dirname,'public/')));
// console.log(path.join(__dirname,'public'));

app.use(session({secret: 'nah im good'}));

app.use('/',defaultRo);
app.use('/dateres', dateresRo);
app.use('/dashboard',dashboardRo);
app.use('/getmenu',menuRo);
app.use('/getnotif',notifRo);
app.use('/updateApproval', approvalRo);
app.use('/changeavl',avlRo);
app.use('/getresnotif',resnotifRo);

app.listen(3000);
