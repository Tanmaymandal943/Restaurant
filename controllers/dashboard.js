// const login_data = require('../models/auth');
const e = require('express');
const helper_func = require('../models/helper');
const pool = require('../utils/database');

exports.get_dashboard = (req, res, next) => {
    login_data=req.session;
    if (!login_data.logged_in_user) {
        res.redirect('/');
    }
    if (login_data.user_designation == "cashier") {
        helper_func.get_cur_name()
            .then(ret => {
                res.render('cashier', {
                    name: ret,
                    id_entered: false,
                    error_check: false
                });
            });
    }
    if (login_data.user_designation == "reservation manager") {
        var res_success = true;
        if(req.query.success_table_assigned){
            if(req.query.success_table_assigned=='f'){
                res_success=false;
            }
        }
        var future_success=true;
        if(req.query.future_success){
            if(req.query.future_success=='0'){
                future_success=false;
            }
        }
        var waitlist_success=true;
        if(req.query.waitlist_success){
            if(req.query.waitlist_success=='0'){
                waitlist_success=false;
            }
        }
        var add_customer_success=true;
        var show_created_id=false;
        var created_id=-1;
        if(req.query.add_customer_success){
            if(req.query.add_customer_success=='0'){
                add_customer_success=false;
            }
        }
        if(req.query.created_id){
            show_created_id=true;
            created_id=req.query.created_id;
        }
        helper_func.get_menu([], [], 0, [], 0)
            .then(rows => {
                helper_func.get_cur_name()
                    .then(ret => {
                        helper_func.get_tables()
                            .then(ret0 => {
                                var free_num = 0;
                                var free_num2 = 0;
                                for (var i = 0; i < ret0.length; i++) {
                                    if (ret0[i].avl) {
                                        free_num += 1;
                                    }
                                }
                                helper_func.get_waiter_tables()
                                    .then(ret1 => {
                                        // console.log(ret1);

                                        helper_func.get_food_types()
                                            .then(ret2 => {
                                                helper_func.get_cuisine_types()
                                                    .then(ret3 => {
                                                        res.render('reservation', {
                                                            emp_name: ret,
                                                            tables: ret0,
                                                            total_num: ret0.length,
                                                            free_num: free_num,
                                                            res_success: res_success,
                                                            future_success: future_success,
                                                            waitlist_success: waitlist_success,
                                                            add_customer_success: add_customer_success,
                                                            show_created_id: show_created_id,
                                                            created_id: created_id,
                                                            waiter_tables: ret1,
                                                            food_type: ret2,
                                                            cuisine_type: ret3,
                                                            menu: rows,
                                                            show_price: 0,
                                                            show_rating: 0,
                                                            show_food: [],
                                                            show_cuisine: [],
                                                            show_veg: []
                                                        });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    }

    if (login_data.user_designation == "waiter") {
        var error_show=false;
        // console.log(req.query.success);
        if(req.query.success){
            if(Number(req.query.success)!=1){
                error_show=true;
            }
        }
        // console.log(error_show);
        helper_func.get_cur_name()
            .then(ret => {
                helper_func.get_ord_tables()
                    .then(ret0 => {
                        // console.log(ret0);
                        helper_func.get_menu()
                            .then(rows => {
                                helper_func.get_food_types()
                                    .then(ret2 => {
                                        helper_func.get_cuisine_types()
                                            .then(ret3 => {
                                                var part2 = [];
                                                // console.log(ret0.part2);
                                                for (var j = 0; j < ret0.part2.length; j++) {
                                                    var temp = ret0.part2[j].array_agg;
                                                    var bracket_lst = temp.substring(2, temp.length - 2).split("\",\"");
                                                    for (var i = 0; i < bracket_lst.length; i++) {
                                                        bracket_lst[i] = bracket_lst[i].substring(1, bracket_lst[i].length - 1);
                                                    }
                                                    part2.push(bracket_lst);
                                                }
                                                var num_not_prepared = 0;
                                                var num_order_not_taken = 0;
                                                for (var i = 0; i < ret0.part1.length; i++) {
                                                    if (ret0.part1[i].order_status == 'not prepared') {
                                                        num_not_prepared += 1;
                                                    }
                                                    if (ret0.part1[i].order_status == 'order not taken') {
                                                        num_order_not_taken += 1;
                                                    }
                                                }
                                                res.render('waiter', {
                                                    emp_name: ret,
                                                    tables: ret0.part1,
                                                    part2: part2,
                                                    num_not_prepared: num_not_prepared,
                                                    num_order_not_taken: num_order_not_taken,
                                                    menu: rows,
                                                    show_price: 0,
                                                    show_rating: 0,
                                                    show_food: [],
                                                    show_cuisine: [],
                                                    show_veg: [],
                                                    food_type: ret2,
                                                    cuisine_type: ret3,
                                                    error_show: error_show,
                                                    id: req.query.id
                                                });
                                            });
                                    });
                            });
                    });
            });
    }
    if (login_data.user_designation == 'tech admin') {
		helper_func.get_cur_name().then((name) => {
			helper_func.getEmployeeDetails().then((employees) => {
				helper_func.getRequests('t', 'f').then((doneIngReq) => {
					helper_func.getRequests('f', 'f').then((doneMiscReq) => {
						helper_func.getRequests('t', 't').then((pendIngReq) => {
							helper_func.getRequests('f', 't').then((pendMiscReq) => {
								helper_func.getMonthlySales().then((data1) => {
									helper_func.getMonthlyTips().then((data2) => {
										res.render('Owner_Base', {
											name: name,
											employees: employees,
											doneIngReq: doneIngReq,
											doneMiscReq: doneMiscReq,
											pendIngReq: pendIngReq,
											pendMiscReq: pendMiscReq,
											labels1: data1[0],
											data1: data1[1],
											max1: data1[2],
											labels2: data2[0],
											data2: data2[1],
											max2: data2[2],
										})
									})
								})
							})
						})
					})
				})
			})
		})
	}

    if (login_data.user_designation == "kitchen manager") {
        helper_func.get_cur_name()
            .then(ret => {
                helper_func.get_live_orders()
                    .then(ret0 => {
                        helper_func.get_food_types()
                            .then(ret2 => {
                                helper_func.get_cuisine_types()
                                    .then(ret3 => {
                                        // console.log(ret0.part2);
                                        var part2 = [];
                                        // console.log(ret0.part2);
                                        for (var j = 0; j < ret0.part2.length; j++) {
                                            var temp = ret0.part2[j].array_agg;
                                            var bracket_lst = temp.substring(2, temp.length - 2).split("\",\"");
                                            for (var i = 0; i < bracket_lst.length; i++) {
                                                bracket_lst[i] = bracket_lst[i].substring(1, bracket_lst[i].length - 1);
                                            }
                                            part2.push(bracket_lst);
                                        }
                                        res.render('kitchen',{
                                            emp_name: ret,
                                            tables: ret0.part1,
                                            part2: part2,
                                            food_type: ret2,
                                            cuisine_type: ret3,
                                            show_price: 0,
                                            show_rating: 0,
                                            show_food: [],
                                            show_cuisine: [],
                                            show_veg: []
                                        })
                                    })
                            })
                    })
            })
    }

    // console.log(login_data.user_designation);
    if (login_data.user_designation == "general manager") {
		helper_func.get_cur_name().then((name) => {
			helper_func.getEmployeeDetails().then((employees) => {
				helper_func.getRequests('t', 'f').then((doneIngReq) => {
					helper_func.getRequests('f', 'f').then((doneMiscReq) => {
						helper_func.getRequests('t', 't').then((pendIngReq) => {
							helper_func.getRequests('f', 't').then((pendMiscReq) => {
								helper_func.getMonthlySales().then((data1) => {
									helper_func.getMonthlyTips().then((data2) => {
										res.render('manager', {
											name: name,
											employees: employees,
											doneIngReq: doneIngReq,
											doneMiscReq: doneMiscReq,
											pendIngReq: pendIngReq,
											pendMiscReq: pendMiscReq,
											labels1: data1[0],
											data1: data1[1],
											max1: data1[2],
											labels2: data2[0],
											data2: data2[1],
											max2: data2[2],
										})
									})
								})
							})
						})
					})
				})
			})
		})
	}

};

exports.post_dashboard = (req, res, next) => {
    login_data=req.session;
    if (!login_data.logged_in_user) {
        res.render('login', { checker: false });
    }
    if (login_data.user_designation == "cashier") {
        helper_func.get_cur_name()
            .then(ret => {
                helper_func.get_order(req.body.order_id)
                    .then(ret1 => {
                        if (ret1.order_status != "yet to pay") {
                            res.render('cashier', {
                                name: ret,
                                id_entered: false,
                                error_check: true
                            })
                        }
                        else {
                            res.render('cashier', {
                                name: ret,
                                id_entered: true,
                                order: ret1
                            });
                        }
                    })
            });
    }
    if (login_data.user_designation == "reservation manager") {
        var food_type_str;
        // console.log(req.body.food_type);
        if (req.body.food_type.constructor === Array) {
            food_type_str = req.body.food_type;
        }
        else {
            food_type_str = [req.body.food_type];
        }

        var cuisine_type_str;
        if (req.body.cuisine_type.constructor === Array) {
            cuisine_type_str = req.body.cuisine_type;
        }
        else {
            cuisine_type_str = [req.body.cuisine_type];
        }
        // console.log(cuisine_type_str);

        // console.log(req.body.rating);

        veg_check_str = [];
        var veg_temp;
        if (req.body.veg_check.constructor === Array) {
            veg_temp = req.body.veg_check;
        }
        else {
            veg_temp = [req.body.veg_check];
        }
        // console.log(req.body.veg_check);
        // console.log(req.body.veg_check.length);
        for (var i = 0; i < veg_temp.length; i++) {
            if (veg_temp[i] == "veg") {
                veg_check_str.push('t');
            }
            else {
                veg_check_str.push('f');
            }
        }
        // console.log(veg_check_str);

        // req.body.price
        helper_func.get_menu(food_type_str, cuisine_type_str, req.body.rating, veg_check_str, req.body.price)
            .then(rows => {
                helper_func.get_cur_name()
                    .then(ret => {
                        helper_func.get_tables()
                            .then(ret0 => {
                                var free_num = 0;
                                var free_num2 = 0;
                                for (var i = 0; i < ret0.length; i++) {
                                    if (ret0[i].avl) {
                                        free_num += 1;
                                    }
                                }
                                helper_func.get_waiter_tables()
                                    .then(ret1 => {
                                        // console.log(ret1);
                                        helper_func.get_food_types()
                                            .then(ret2 => {
                                                helper_func.get_cuisine_types()
                                                    .then(ret3 => {
                                                        res.render('reservation', {
                                                            emp_name: ret,
                                                            tables: ret0,
                                                            total_num: ret0.length,
                                                            free_num: free_num,
                                                            res_success: true,
                                                            waiter_tables: ret1,
                                                            food_type: ret2,
                                                            cuisine_type: ret3,
                                                            menu: rows,
                                                            show_price: req.body.price,
                                                            show_rating: req.body.rating,
                                                            show_food: food_type_str,
                                                            show_cuisine: cuisine_type_str,
                                                            show_veg: veg_check_str
                                                        });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    }
    if (login_data.user_designation == 'tech admin') {
		helper_func.get_cur_name().then((ret) => {
			res.render('Owner_Base', { name: ret })
		})
	}
};

exports.post_dashboard_bill_paid = (req, res, next) => {
    login_data=req.session;
    if (!login_data.logged_in_user) {
        res.render('login', { checker: false });
    }
    if (login_data.user_designation == "cashier") {
        helper_func.bill_paid(req.body.waiter_tip,req.body.cashier_order_id).then(() => {
            res.redirect('/dashboard');
        })
    }
};

exports.post_dashboard_table_assigned = (req, res, next) => {
    login_data=req.session;
    if (!login_data.logged_in_user) {
        res.render('login', { checker: false });
    }
    if (login_data.user_designation == "reservation manager") {
        // console.log(req.body.checkbox_arr);
        var table_id_arr=[];
        for(var i=0; i<req.body.checkbox_arr.length; i++){
            if(req.body.checkbox_arr[i]!='-1'){
                table_id_arr.push(Number(req.body.checkbox_arr[i]));
            }
        }
        helper_func.assign_table(table_id_arr, req.body.cust_id, req.body.emp_id_waiter).then((success) => {
            res.redirect('/dashboard?success_table_assigned='+success);
        })
    }
};

exports.post_dashboard_reservation_success = (req, res, next) => {
    login_data=req.session;
    if (!login_data.logged_in_user) {
        res.render('login', { checker: false });
    }
    if (login_data.user_designation == "reservation manager") {
        var c_arr=req.body.res_checkbox_arr;
        var table_id_arr=[];
        for(var i=0; i<c_arr.length; i++){
            if(c_arr[i]!='-1'){
                table_id_arr.push(c_arr[i]);
            }
        }
        helper_func.add_future_reservation(table_id_arr, req.body.future_date, req.body.future_slot_num, req.body.future_cust_id).then((future_success) => {
            res.redirect('/dashboard?future_success='+future_success);
        })
    }
};

exports.post_dashboard_waitlist_success = (req, res, next) => {
    login_data=req.session;
    if (!login_data.logged_in_user) {
        res.render('login', { checker: false });
    }
    if (login_data.user_designation == "reservation manager") {
        var v1=req.body.waitlist_cust_id;
        var v2=req.body.waitlist_cust_count;
        helper_func.add_future_waitlist(v1,v2).then((waitlist_success) => {
            res.redirect('/dashboard?waitlist_success='+waitlist_success);
        })
    }
};

exports.post_dashboard_modify_cust_success = (req, res, next) => {
    login_data=req.session;
    if (!login_data.logged_in_user) {
        res.render('login', { checker: false });
    }
    if (login_data.user_designation == "reservation manager") {
        if(!req.body.add_cust_emp){
            // console.log("entered");
            helper_func.add_customer(req.body.add_cust_name, req.body.add_cust_age, req.body.add_cust_email, req.body.add_cust_phone).then((cust_id) => {
                res.redirect('/dashboard?add_customer_success='+1+'&created_id='+cust_id);
            })
        }
        else{
            // console.log(req.body.add_cust_emp_id);
            helper_func.modify_emp_customer(req.body.add_cust_emp_id).then((arr) => {
                if(Number(arr[1])==-1){
                    res.redirect('/dashboard?add_customer_success='+arr[0]);
                }
                else{
                    res.redirect('/dashboard?add_customer_success='+arr[0]+'&created_id='+arr[1]);
                }
            })
        }
    }
};

exports.post_dashboard_send_order = (req, res, next) => {
    login_data=req.session;
    if (!login_data.logged_in_user) {
        res.render('login', { checker: false });
    }
    if(login_data.user_designation == "waiter"){

        if(req.body.status_hidden == "served")
        {
            
            var order_id = req.body.order_id;
            var feedback = req.body.Feedback;
            helper_func.take_feedback(order_id,feedback)
                    .then((success) => {
                         res.redirect('/dashboard?success='+success+"&id="+order_id);
                    })
            

        }
        else if(req.body.status_hidden == "ready to serve")
        {
            var order_id = req.body.order_id;
            // var feedback = req.body.Feedback;
            helper_func.update_served(order_id)
                    .then((success) => {
                         res.redirect('/dashboard?success='+success+"&id="+order_id);
                    })
            
        }
        else {
        var order_id = req.body.order_id;
        var pair_list=req.body.hidden_items.split("|");
        helper_func.take_order(order_id, pair_list)
            .then((success) => {
                res.redirect('/dashboard?success='+success+"&id="+order_id);
            })
        }
    }

}

exports.post_dashboard_order_prepared = (req, res, next) => {
    login_data=req.session;
    if (!login_data.logged_in_user){
        res.render('login', {checker: false});
    }
    if(login_data.user_designation == "kitchen manager"){
        helper_func.order_prepared(req.body.order_id_hidden).then(()=> {
            res.redirect('/dashboard');
        })
    }
}

exports.post_dashboard_request_ingredient = (req, res, next) => {
    login_data=req.session;
    if (!login_data.logged_in_user){
        res.render('login', {checker: false});
    }
    if(login_data.user_designation == "kitchen manager" || login_data.user_designation == "general manager"){
        helper_func.insert_expense(req.body.ingredient_name, req.body.details_name, req.body.quantity_name).then(()=> {
            res.redirect('/dashboard');
        })
    }
}

exports.post_dashboard_request_misc = (req, res, next) => {
    login_data=req.session;
    if (!login_data.logged_in_user){
        res.render('login', {checker: false});
    }
    if(login_data.user_designation == "general manager"){
        helper_func.insert_misc_expense(req.body.details, req.body.price).then(()=> {
            res.redirect('/dashboard');
        })
    }
}

exports.post_dashboard_request_item = (req, res, next) => {
    login_data=req.session;
    if (!login_data.logged_in_user){
        res.render('login', {checker: false});
    }
    if(login_data.user_designation == "kitchen manager"){
        helper_func.insert_item_request(req.body.food_name, req.body.food_details, req.body.food_price, req.body.food_cuisine, req.body.food_type, req.body.food_veg).then(()=> {
            res.redirect('/dashboard');
        })
    }
}

exports.post_dashboard_updateDetails = (req, res, next) => {
    login_data=req.session;
	helper_func.updateEmployeeDetails(req.body).then(() => {
		res.redirect('/dashboard#add_update')
	})
}

exports.post_dashboard_deleteEmployee = (req, res, next) => {
    login_data=req.session;
	helper_func.deleteEmployee(req.body.emp_id).then(() => {
		res.redirect('/dashboard#delete_user')
	})
}


