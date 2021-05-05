const pool = require('../utils/database');
module.exports = {
    user_designation: function (username) {
        return pool.query("select designation from person where login_user=$1;", [username])
            .then(json_ret => {
                // console.log(json_ret);
                return json_ret.rows[0].designation;
            });
    },
    get_emp_id: function (user) {
        return pool.query("select emp_id from person where login_user=$1", [user])
            .then(json_ret => {
                return json_ret.rows[0].emp_id;
            })
    },
    auth_user: function (user, pass, req) {
        return pool.query("select count(*) from person where login_user=$1 and login_pswd=$2", [user, pass])
            .then(json_ret => {
                return json_ret.rows[0].count;
            })
            .then(num => {
                if (num == 0) {
                    return "";
                }
                else {
                    return this.get_emp_id(user)
                        .then(ret => {
                            req.session.logged_in_user = ret;
                            return this.user_designation(user);
                        })
                }
            })
    },

    get_cur_name: function () {
        // console.log(user_det.logged_in_user);
        // console.log(login_data);
        return pool.query('select name from person where emp_id=$1', [login_data.logged_in_user])
            .then(json_ret => {
                return json_ret.rows[0].name;
            })
    },



    get_ord_tables: function () {
        // const user_det = require('../models/auth');
        // console.log(user_det.logged_in_user);
        var user_det = login_data;
        dic = {};
        return pool.query('select orders.order_id, orders.order_status, array_agg(table_id) as table_ids from orders, order_table where orders.order_id=order_table.order_id and  orders.emp_id_waiter=$1 and orders.order_status not in (\'paid\',\'yet to pay\') group by orders.order_id,orders.order_status order by orders.order_id;', [user_det.logged_in_user])
            .then(json_ret => {
                dic.part1 = json_ret.rows;
                return pool.query('select orders.order_id,array_agg((name, quantity)) from item_orders, food_item, orders where food_item.food_id=item_orders.food_id and item_orders.order_id=orders.order_id and emp_id_waiter=$1 and order_status not in (\'paid\' , \'yet to pay\') group by orders.order_id order by orders.order_id;', [user_det.logged_in_user]);
            })
            .then(json_ret1 => {
                dic.part2 = json_ret1.rows;
                for(var i=0; i<dic.part1.length; i++){
                    if(dic.part2.length-i==0){
                        var temp={};
                        temp.order_id=dic.part1[i].order_id;
                        temp.array_agg="";
                        dic.part2.push(temp);
                    }
                    else{
                        if(dic.part1[i].order_id!=dic.part2[i].order_id){
                            var temp={};
                            temp.order_id=dic.part1[i].order_id;
                            temp.array_agg="";
                            dic.part2.splice(i,0,temp);
                        }
                        
                    }
                }
                return dic;
            })
    },

    get_live_orders: function () {
        var user_det = login_data;
        // console.log(user_det.logged_in_user);
        dic = {};
        return pool.query('select orders.order_id, orders.order_status, array_agg(table_id) as table_ids from orders, order_table where orders.order_id=order_table.order_id and orders.order_status in (\'not prepared\') group by orders.order_id,orders.order_status order by orders.order_id;')
            .then(json_ret => {
                dic.part1 = json_ret.rows;
                return pool.query('select orders.order_id,array_agg((name, quantity)) from item_orders, food_item, orders where food_item.food_id=item_orders.food_id and item_orders.order_id=orders.order_id and order_status in (\'not prepared\') group by orders.order_id order by orders.order_id;');
            })
            .then(json_ret1 => {
                dic.part2 = json_ret1.rows;
                return dic;
            })
    },

    get_num_not_prepared: function (waiter_bool) {
        var user_det = login_data;
        if(waiter_bool){
            return pool.query('select count(*) from orders where order_status=\'not prepared\' and emp_id_waiter=$1;', [user_det.logged_in_user])
                .then(json_ret => {
                    return pool.query('select count(*) from orders where order_status=\'order not taken\' and emp_id_waiter=$1',[user_det.logged_in_user])
                        .then(json_ret0 => {
                            return Number(json_ret.rows[0].count)+Number(json_ret0.rows[0].count);
                        })
                })
        }
        else{
            return pool.query('select count(*) from orders where order_status=\'not prepared\';')
            .then(json_ret => {
                return json_ret.rows[0].count;
            })
        }
    },

    take_order: function (order_id, tuples) {
        var promises = [];
        var name_list = [];
        for(var i=0; i<tuples.length; i++){
            var tuple = tuples[i].split(",");
            name_list.push(tuple[0]);
        }
        return pool.query('select availability as avl from food_item where name = ANY ($1);',[name_list])
            .then(json_ret => {
                for(var i=0; i<json_ret.rows.length; i++){
                    // console.log(json_ret.rows[i].avl);
                    if(!json_ret.rows[i].avl){
                        return false;
                    }
                }
                for (var i = 0; i < tuples.length; i++) {
                    var tuple = tuples[i].split(",");
                    promises.push(pool.query('insert into item_orders values ($1, (select food_id from food_item where name=$2), $3)', [order_id, tuple[0], tuple[1]]));
                }
                return Promise.all(promises)
                    .then(() => {
                        promises = [];
                        promises.push(pool.query('update orders set order_status=\'not prepared\' where order_id=$1', [order_id]));
                        return Promise.all(promises)
                            .then(() => {
                                return true;
                            })
                    })
            })
        
    },

    take_feedback: function(order_id,feedback)
    {
        
        return pool.query('update orders set order_status=\'yet to pay\', feedback=$2 where order_id=$1', [order_id,feedback])
                    .then(() => {
                        return true;
                    });
    
    },

    get_user_details: function(id)
    {
        return pool.query('select * from person where emp_id=$1',[id]);
    },

    update_served: function(order_id)
    {
        
        return pool.query('update orders set order_status=\'served\' where order_id=$1', [order_id])
                    .then(() => {
                        return true;
                    });
    
    },


    get_order: function (order_id) {
        //cust_id
        //table_num_arr
        //food_items
        //total_bill
        //waiter_name
        dic = {};
        dic.id = order_id;
        return pool.query('select * from orders where order_id=$1', [order_id])
            .then(json_ret => {
                dic.cust_id = json_ret.rows[0].cust_id;
            })
            .then(() => {
                return pool.query('select array_agg(table_id) from order_table where order_id=$1;', [order_id])
                    .then(json_ret0 => {
                        dic.table_num_arr = json_ret0.rows[0].array_agg;
                        return pool.query('select food_item.name,quantity,price from item_orders,food_item where order_id=$1 and item_orders.food_id=food_item.food_id;', [order_id])
                    })
                    .then(json_ret1 => {
                        dic.items = json_ret1.rows;
                        return pool.query('select sum(item_orders.quantity*food_item.price) from item_orders,food_item where order_id=$1 and item_orders.food_id=food_item.food_id;', [order_id])
                    })
                    .then(json_ret2 => {
                        dic.total_bill = json_ret2.rows[0].sum;
                        return pool.query('select person.name from person,orders where person.emp_id=orders.emp_id_waiter and orders.order_id=$1;', [order_id])
                    })
                    .then(json_ret3 => {
                        dic.waiter_name = json_ret3.rows[0].name;
                        return pool.query('select order_status from orders where order_id=$1', [order_id])
                    })
                    .then(json_ret4 => {
                        dic.order_status = json_ret4.rows[0].order_status;
                        return pool.query('select name from orders, person where person.cust_id=orders.cust_id and order_id=$1;', [order_id])
                    })
                    .then(json_ret5 => {
                        dic.cust_name = json_ret5.rows[0].name;
                        return dic;
                    })
            });
    },

    get_tables: function () {
        //capacity
        //available
        dic = {};
        return pool.query('select capacity, not exists (select * from order_table,orders where orders.order_id=order_table.order_id and table_id=A.table_id and orders.order_status not in (\'paid\',\'yet to pay\')) as avl from dining_table as A order by table_id;')
            .then(json_ret => {
                dic = json_ret.rows;
                return dic;
            })
    },

    add_future_reservation: function(table_id_arr, date, slot_num, cust_id){
        return this.get_res_tables(date, slot_num).then((dic) => {
            for(var i=0; i<table_id_arr.length; i++){
                if(!dic.avl[table_id_arr[i]-1]){
                    return '0';
                }
            }
            return pool.query('insert into reservation(reservation_date, slot_num, cust_id) values ($1,$2,$3) returning reservation_id',[date,slot_num,cust_id]).then(json_ret => {
                var res_id=json_ret.rows[0].reservation_id;
                var promises=[];
                for(var i=0; i<table_id_arr.length; i++){
                    promises.push(pool.query('insert into table_reservation values ($1, $2)',[res_id, table_id_arr[i]]));
                }
                return Promise.all(promises).then(()=> {
                    return '1';
                })
            })
        })
    },

    get_res_tables: function (date, slot) {
        //capacity
        //available
        dic = {};
        return pool.query('select capacity  from dining_table as A order by table_id;')
            .then(json_ret => {
                dic.capacity = json_ret.rows;
                return pool.query('select table_id from table_reservation, reservation where table_reservation.reservation_id=reservation.reservation_id and reservation_date=$1 and slot_num=$2;', [date, slot])
                    .then(json_ret0 => {
                        dic.avl = [];
                        for (var i = 0; i < dic.capacity.length; i++) {
                            var found = 0;
                            for (var j = 0; j < json_ret0.rows.length; j++)
                                if (json_ret0.rows[j].table_id == i + 1) {
                                    found = 1;
                                }
                            if (found == 1) {
                                dic.avl.push(false);
                            }
                            else {
                                dic.avl.push(true);
                            }
                        }
                        // dic.avl = json_ret0.rows;
                        return dic;
                    })

            })


    },

    order_prepared: function (order_id){
        return pool.query('update orders set order_status=\'ready to serve\' where order_id = $1', [order_id]).then(()=> {return;});
    },

    change_avl: function(id) {
        return pool.query('update food_item set availability=not availability where food_id=$1',[id]).then(() => {
            return;
        })
    },

    get_waiter_tables: function () {
        dic = {}
        return pool.query('select emp_id from person where designation = \'waiter\'')
            .then(json_ret => {
                dic = json_ret.rows;
                return dic;
            })
    },

    get_food_types: function () {
        return pool.query('select distinct food_type from food_item where pending=\'f\';')
            .then(json_ret => {
                return json_ret.rows;
            })
    },

    get_cuisine_types: function () {
        return pool.query('select distinct cuisine_type from food_item where pending=\'f\';')
            .then(json_ret => {
                return json_ret.rows;
            })
    },

    add_future_waitlist: function (id, count) {
        return pool.query('select count(*) from person where cust_id=$1',[id]).then(json_ret => {
            if(Number(json_ret.rows[0].count)==0){
                return 0;
            }
            return pool.query('insert into waitlist(cust_id, cust_count) values ($1,$2)',[id,count]).then(() => {
                return 1;
            })    
        })
    },

    add_customer: function(name, age, email, phone){
        return pool.query('select max(cust_id) from person where cust_id is not null').then(json_ret => {
            var cust_id=Number(json_ret.rows[0].max)+1;
            // console.log(cust_id);
            return pool.query('insert into person(name,age,cust_id,cust_rating,cust_type) values ($1,$2,$3,6,\'new\') returning person_id',[name,age,cust_id]).then((json_ret)=>{
                var promises = [];
                var person_id=json_ret.rows[0].person_id;
                // console.log(phone);
                // console.log(email);
                var phone_list = phone.split(";");
                var email_list = email.split(";");
                // console.log(name);
                // console.log(age);
                // console.log(email);
                // console.log(phone);
                // console.log(phone_list);
                // console.log(email_list);
                for(var i=0; i<phone_list.length; i++){
                    promises.push(pool.query('insert into person_phone values ($1,$2)',[person_id, phone_list[i].trim()]));
                }
                for(var i=0; i<email_list.length; i++){
                    promises.push(pool.query('insert into person_email values ($1,$2)',[person_id, email_list[i].trim()]));
                }
                return Promise.all(promises).then(() => {return cust_id;})
            })
        })
    },

    modify_emp_customer: function(emp_id){
        return pool.query('select count(*) from person where emp_id=$1',[emp_id]).then(json_ret => {
            if(Number(json_ret.rows[0].count)==0){
                return [0,-1];
            }
            return pool.query('select count(*) from person where emp_id=$1 and cust_id is not null',[emp_id]).then(json_ret0 => {
                if(Number(json_ret0.rows[0].count)!=0){
                    return [0,-1]
                }
                return pool.query('select max(cust_id) from person where cust_id is not null').then(json_ret => {
                    var cust_id=Number(json_ret.rows[0].max)+1;
                    return pool.query('update person set cust_id=$1, cust_rating=6, cust_type=\'new\' where emp_id=$2',[cust_id,emp_id]).then(() => {
                        return [1,cust_id];
                    })
                })
            })
        })
    },

    get_menu: function (food, cuisine, rating, veg, price, kitchen) {
        if(Number(kitchen)=="0"){
            return pool.query(`select * from food_item where pending='f' and price<=$1 and availability=\'t\' and cuisine_type = ANY ($2) and food_type = ANY($3) and veg = ANY($4) and rating>=$5 order by name`,
                [price, cuisine, food, veg, rating])
                .then(json_ret => {
                    return json_ret.rows;
                })
        }
        else{
            return pool.query(`select * from food_item where price<=$1 and pending='f' and cuisine_type = ANY ($2) and food_type = ANY($3) and veg = ANY($4) and rating>=$5 order by name`,
                [price, cuisine, food, veg, rating])
                .then(json_ret => {
                    return json_ret.rows;
                })
        }
    },

    update_reservation: function (arr, cust_id) {
        return Promise.value(0);
        // return pool.query('insert into orders values ()')
    },

    updateEmployeeDetails: function (body) {
        return pool
            .query('select count(*) from person where emp_id=$1;', [body.emp_id])
            .then((countRet) => {
                if (countRet.rows[0].count == 0) {
                    return pool
                        .query(
                            `
                    insert into person(name,age,emp_id,designation,salary,address,login_user,login_pswd,emp_rating,cust_id,cust_rating,cust_type)
                    values ($1,$2,$3,$4,$5,$6,$7,$8,5,null,null,null)
                    returning person_id;
                    `,
                            [
                                body.name,
                                body.age,
                                body.emp_id,
                                body.designation,
                                body.salary,
                                body.address,
                                body.login_user,
                                body.login_pswd,
                            ]
                        )
                        .then((idRet1) => {
                            return pool.query(
                                'insert into person_phone(person_id,phone) values ($1,$2) returning person_id',
                                [idRet1.rows[0].person_id, body.phone]
                            )
                        })
                        .then((idRet2) => {
                            return pool.query(
                                'insert into person_email(person_id,email) values ($1,$2)',
                                [idRet2.rows[0].person_id, body.email]
                            )
                        })
                } else {
                    return pool
                        .query(
                            `
                    update person set name=$1,age=$2,emp_id=$3,designation=$4,salary=$5,address=$6,login_user=$7,login_pswd=$8
                    where emp_id=$9
                    returning person_id;
                    `,
                            [
                                body.name,
                                body.age,
                                body.emp_id,
                                body.designation,
                                body.salary,
                                body.address,
                                body.login_user,
                                body.login_pswd,
                                body.emp_id,
                            ]
                        )
                        .then((retID) => {
                            return pool.query(
                                'update person_phone set phone=$1 where person_id=$2 returning person_id;',
                                [body.phone, retID.rows[0].person_id]
                            )
                        })
                        .then((retID2) => {
                            return pool.query(
                                'update person_email set email=$1 where person_id=$2;',
                                [body.email, retID2.rows[0].person_id]
                            )
                        })
                }
            })
    },

    deleteEmployee: function (emp_id) {
        return pool.query('delete from person where emp_id=$1', [emp_id])
    },

    getEmployeeDetails: function () {
        return pool
            .query('select * from person where emp_id is not null;')
            .then((ret) => {
                return ret.rows
            })
    },

    getRequests: function (type, status) {
        return pool
            .query(
                'select * from expenses where ingredient=$1 and pending=$2 order by expense_id desc;',
                [type, status]
            )
            .then((ret) => {
                return ret.rows
            })
            .catch((e) => console.error(e.stack))
    },

    updateApproval: function (id, status) {
        if (status == 'Update') {
            return pool.query(
                "update expenses set pending = 'f' where expense_id=$1;",
                [id]
            )
        } else {
            return pool.query('delete from expenses where expense_id=$1;', [id])
        }
    },

    getMonthlySales: function () {
        return pool
            .query(
                `
        select to_char(order_date,'Mon') as mon,
        extract(year from order_date) as yyyy, sum((select sum(item_orders.quantity*food_item.price) from item_orders,food_item where order_id=A.order_id and item_orders.food_id=food_item.food_id)) as total 
        from orders as A
        where order_status='paid'
        group by 1,2
        order by 2,1;
         
        `
            )
            .then((ret) => {
                var Data = ret.rows
                var labels = []
                var data = []
                var max = 0
                for (var i = 0; i < Data.length; i++) {
                    labels.push(Data[i].mon + Data[i].yyyy)
                    data.push(Data[i].total)
                    max = Math.max(max, Data[i].total)
                }
                return [labels, data, max]
            })
    },

    getMonthlyTips: function () {
        return pool
            .query(
                `
        select to_char(order_date,'Mon') as mon,
        extract(year from order_date) as yyyy, sum(tip) as tips
        from orders
        where order_status='paid'
        group by 1,2
        order by 2,1;
        `
            )
            .then((ret) => {
                var Data = ret.rows
                var labels = []
                var data = []
                var max = 0
                for (var i = 0; i < Data.length; i++) {
                    labels.push(Data[i].mon + Data[i].yyyy)
                    data.push(Data[i].tips)
                    max = Math.max(max, Data[i].tips)
                }
                return [labels, data, max]
            })
    },

    bill_paid: function(tip,order_id){
        return pool.query('update orders set order_status=\'paid\', tip = $1 where order_id=$2', [tip, order_id]).then(() => {return;});
    },

    insert_expense: function(ingredient_name, details,quantity){
        return pool.query('select price,ingredient_id from ingredients where ingredient_name=$1',[ingredient_name]).then(json_ret => {
            return pool.query('insert into expenses(details,price_total,ingredient,ingredient_id,pending) values ($1,$2,\'t\',$3,\'t\')',
                                [details,quantity*json_ret.rows[0].price,json_ret.rows[0].ingredient_id]).then(()=> {return;});
        })
    },
    
    
    insert_misc_expense: function(details,price){
            return pool.query('insert into expenses(details,price_total,ingredient,pending) values ($1,$2,\'f\',\'t\')',
                                [details,price]).then(()=> {return;});
    },

    insert_item_request: function(food_name, food_details, food_price, food_cuisine, food_type, food_veg){
        return pool.query('insert into food_item(name, price,availability, rating, cuisine_type, veg, food_type, pending, approval_details) values ($1,$2,\'f\',6,$3,$4,$5,\'t\',$6)',
                                [food_name, food_price, food_cuisine, food_veg, food_type, food_details]).then(()=>{return;});
    },

    assign_table: function(table_id_arr, cust_id, waiter_id){
        //return Boolean;
        return this.get_tables().then(rows => {
            // console.log(table_id_arr);
            // console.log(cust_id);
            // console.log(waiter_id);
            // console.log(rows);
            for(var i=0; i<table_id_arr.length; i++){
                if(!rows[table_id_arr[i]-1].avl){
                    return 'f';
                }
            }
            return pool.query(`insert into orders(order_status,order_date,cust_id,feedback,emp_id_waiter,tip,emp_id_cashier) 
                                values ('order not taken', '2021-03-23', $1, null, $2, null, null) RETURNING order_id`,[cust_id, waiter_id]).then((order_id) => {
                                    var promises = [];
                                    for( var i=0; i<table_id_arr.length; i++){
                                        // console.log(order_id.rows[0].order_id);
                                        // console.log(table_id_arr[i]);
                                        promises.push(pool.query(`insert into Order_table values($1,$2)`,[order_id.rows[0].order_id,table_id_arr[i]]))
                                    }
                                    return Promise.all(promises)
                                }).then(() => {return 't';})
        })
    }
};
