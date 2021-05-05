// const login_data = require('../models/auth');
const helper_func = require('../models/helper');

exports.get_notif = (req,res,next) => {
    login_data=req.session;
    var waiter_bool=false;
    if(!req.query.waiter_bool){
        waiter_bool=true;
    }
    helper_func.get_num_not_prepared(waiter_bool)
        .then(ret => {
                res.render('notif_placeholder', {num : ret
                        });
                });
    
};