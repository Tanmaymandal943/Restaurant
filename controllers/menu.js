// const login_data = require('../models/auth');
const helper_func = require('../models/helper');

exports.get_menu = (req,res,next) => {
    var login_data=req.session;
    var food=req.query.food.split(",");
    var cuisine=req.query.cuisine.split(",");
    var veg=req.query.veg.split(",");
    var kitchen=req.query.kitchen;
    helper_func.get_menu(food, cuisine, req.query.rating, veg, req.query.price, kitchen)
        .then(ret => {
                res.render('menu_placeholder', {menu : ret,
                        });
                });
    
};