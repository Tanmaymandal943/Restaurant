// const login_data = require('../models/auth');
const helper_func = require('../models/helper');

exports.get_avl = (req,res,next) => {
    login_data=req.session;
    helper_func.change_avl(req.query.food_id)
        .then(ret => {
                        res.render('avl');
                });
    
};