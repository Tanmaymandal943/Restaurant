const e = require('express');
// const login_data = require('../models/auth');
const helper_func = require('../models/helper');

exports.get_default = (req,res,next) => {
    login_data=req.session;
    if(login_data.logged_in_user){
        res.redirect('dashboard');
    }
    else{
        res.render('login',{checker: false});
    }
    // if(login_data.logged_in_user==-1){
    //     res.render('login', {checker: false});
    // }    
    // else{
    //     res.redirect('dashboard');
    // }
};

exports.post_default = (req, res, next) => {
    return helper_func.auth_user(req.body.login_user,req.body.pass, req)
            .then(ret => {
                login_data=req.session;
                switch(ret){
                    case "cashier":
                        login_data.user_designation="cashier";
                        res.redirect('dashboard');
                        break;
                    case "waiter":
                        login_data.user_designation="waiter";
                        res.redirect('dashboard');
                        break;
                    case "kitchen manager":
                        login_data.user_designation="kitchen manager";
                        res.redirect('dashboard');
                        break;
                    case "reservation manager":
                        login_data.user_designation="reservation manager";
                        console.log(login_data);
                        res.redirect('dashboard');
                        break;
                    case "tech admin":
                        login_data.user_designation="tech admin";
                        res.redirect('dashboard');
                        break;
                    case "general manager":
                        login_data.user_designation="general manager";
                        res.redirect('dashboard');
                        break;
                    
                    case "":
                        res.render('login', {checker: true});
                        break;
                }
            })
}

exports.post_logout = (req, res, next) => {
    req.session.destroy();
    res.redirect('/');
}

exports.get_profile = (req, res, next) => {
    login_data=req.session;
    if(login_data.logged_in_user){
        return helper_func.get_user_details(login_data.logged_in_user).then(ret => {
            var dic=ret.rows[0];
            var tlst=dic.designation.split(" ");
            var str="";
            for(var i=0; i<tlst.length; i++){
                str+=(tlst[i][0].toUpperCase()+tlst[i].substring(1)+" ");
            }
            str=str.substring(0,str.length-1);
            dic.designation=str;
            res.render('profile',{dic: ret.rows[0]});
        })
    }
    else{
        res.redirect('/');
    }
}