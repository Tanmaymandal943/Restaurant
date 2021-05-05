// const login_data = require('../models/auth');
const helper_func = require('../models/helper');

exports.get_resnotif = (req,res,next) => {
    login_data=req.session;
    helper_func.get_tables()
        .then(ret => {
                res.render('resnotif_placeholder', {lst : ret
                        });
                });
    
};