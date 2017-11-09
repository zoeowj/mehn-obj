//导入依赖
var express = require('express');
var pubfun = require('../lib/common.model');
var manageModel = require('../models/admin');

var router = express.Router();

//配置路由
//GET
router.get('/',function(req,res){
    res.render("admin/login",{layout:null});
});
//退出登录
router.get('/sign-out',function(req,res){
    req.session.role = null;
    return res.redirect('/');
});
router.get('/dashboard',authorize,dashboard);



//POST
router.post('/login',login);

//管理员登录
function login(req, res) {
    console.log(req.body);
    var data ;
    manageModel.find({loginname:req.body.loginname,
        hashed_password:pubfun.hashPW(req.body.pwd)
    },function (err,manages) {
        if(err) {console.log(err);}
        else{
            if (manages.length > 0) {
                req.session.role = 'manager';
                data = {
                    layout:'manage',
                    code: 1,
                    url: '/admin/dashboard',
                    msg: '登录成功！'
                };
                res.render('admin/dashboard',data);
            } else {
                data = {
                    layout:null,
                    code: 0,
                    url: '/admin/',
                    msg: '登录名或密码错误！'};
                res.render('admin/login',data);
            }
        }
    });
}

function dashboard(req,res){
    res.render('admin/dashboard',{layout:'manage'});
}
//验证管理员是否登录
function authorize(req,res,next) {
    if(req.session.role){return next();}
    else{
        res.redirect(303,'/unauthorized');
    }
}


module.exports = router;















































