const e = require('express');
// const login_data = require('../models/auth');
const helper_func = require('../models/helper');

exports.get_default = (req,res,next) => {
        login_data=req.session;
        helper_func.get_res_tables(req.query.date,req.query.slot)
            .then(ret => {
                    
                    res.render('date_reservation', {tables : ret,
                            });
                    });
    
    
};
