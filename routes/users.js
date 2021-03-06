//导入依赖
var express = require('express');

var mongoose = require('mongoose');
var validator = require('validator');
var pubfun    = require('../lib/common.model.js')
var credentials = require('../credentials.js');
var emailService = require('../lib/email.js')(credentials);
var userModel = require('../models/user.js');
var formidable = require('formidable');
var fs = require('fs');
const  AVATAR_UPLOAD_FOLDER = '/avatar/';

var router = express.Router();

//配置路由
router.get('/signin', function(req, res){
    res.render("users/signin");
});
router.get('/signup', function(req, res){
    res.render("users/signup");
});
router.get('/list', function(req, res){
    // res.render("users/list");
    if(req.session.role == 'manager'){
        res.render('users/list',{layout:'manage'});
    }
    else{
        res.render('users/list');
    }
});
router.get('/profile',getProfile);
//编辑----显示数据
router.get('/show-user/:id',showUser);
//删除
router.get('/delete-user/:id',deleteUser);
router.get('/get-users-list',getUsersList);


router.post('/signin',checkCaptcha,signin);
router.post('/get-users-list',getUsersList);
//验证
router.post('/signup',checkPhone,checkPassword,checkCaptcha,signup);
//上传文件
router.post('/upload-profile/:UID/:year/:month/:timestr',uploadProfile);
//保存数据
router.post('/save-profile',saveProfile);
//新增
router.post('/add-data',addData);




//中间件要加next
//手机号验证
function checkPhone(req,res,next){
    let retData = {};
    if(!validator.isMobilePhone(req.body.phone,"zh-CN")){
        retData.code = 0;
        retData.msg = "请输入正确的手机号！";
        console.log(retData);
        return res.send(retData);
    }
    next();
}
//验证码验证
function checkCaptcha(req,res,next){
let retData = {};
if(req.session.captcha.toLowerCase() !== req.body.validation){
    retData.code = 0;
    retData.msg = "输入错误！！！";
    retData.id = "errorMsg-validate";
    console.log(retData);
    return res.send(retData);
}
next();
}
//密码验证
function checkPassword(req,res,next){
let retData = {};
if(!validator.isLength(req.body.pwd,{min:6,max:20})){
    retData.code = 0;
    retData.msg = "请输入6~20位密码！";
    console.log(retData);
    return res.send(retData);
}
    if(req.body.repwd !== req.body.pwd){
        retData.code = 0;
        retData.msg = "两次输入密码不一致！";
        console.log(retData);
        return res.send(retData);
    }
next();
}
//获取用户列表并发送到前端
function getUsersList(req,res) {
    var data = {};
    userModel.find({},function (err,users) {
        if(err) { console.log(err); }
        else
        {
            data = {
                code: 1,
                users: users};
            if(req.session.role){
                data.role = req.session.role;
            }
            return res.send(data);
        }
    });
    
}
//查询数据并传递数据到profile视图
function getProfile(req,res){
    if(req.session.phone)
    {
        userModel.find({phone:req.session.phone},
            function (err,users) {
                if(err){console.log(err);}
                else{
                    var retData = {users:users,code:1}
                    var now         = new Date();
                    retData.UID     = req.session.phone;
                    retData.year    = now.getFullYear();
                    retData.month   = now.getMonth();
                    retData.timestr = Date.now();
                    if(req.xhr){
                        res.send(retData);
                    }
                    else{
                        res.render("users/profile",retData);
                    }
                }
            });
    }
}
//处理上传文件
function uploadProfile(req,res) {
    console.log(req.body);
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER;	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    form.parse(req, function(err, fields, files){
        if(err) return res.redirect(303, '/error');
        
        var extName = '';  //后缀名
        switch (files.photo.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }
        console.log(files);
        //req.params.timestr
        //本地
        /*var newPath = 'public\\avatar_2\\'+req.params.timestr+"."+extName;*/
        var newPath = 'public/avatar_2/'+req.params.timestr+"."+extName;
        
        fs.renameSync(files.photo.path, newPath);  //重命名
        //console.log(files.photo.path+"-----"+files.photo.name +"###"+ extName +"==="+req.params.year);
        //console.log('received fields:');
        var imgpath='/avatar_2/'+req.params.timestr+"."+extName;
        updateProfilePicture (req.params.UID,imgpath);
        
        //var data = {imgpath:imgpath};
        return  res.redirect('/users/profile?imgpath='+imgpath);
        // return  res.send(data);
        
    });
}
//更新个人肖像
function updateProfilePicture (UID,imgpath) {
    var data = {};
    
    userModel.update({phone:UID},
        {$set:{picture:imgpath,
            update:true}},
        {upsert:false,multi:false})
        .exec(function (err,users) {
            if(err){
                data = {msg: 'Update failure for '
                + UID,code:'0'};
            }else {
                
                data = {msg: 'Update successful for '
                + UID,code:'1'};
            }
            // res.send(data);
        });
}
//保存数据
function saveProfile(req,res){
    console.log("saveProfile", req.body);
    userModel.update({phone:req.body.phone},
        {$set:{
            realName:req.body.realName,
            nickName:req.body.nickName,
            userName:req.body.userName,
            phone:req.body.phone,
            email:req.body.email,
            gender:req.body.gender,
            age:req.body.age,
            address:req.body.address,
            update:true}},
        {upsert:false,multi:false}).exec(function(err,users){
            if(err){console.log(err)}
            else{
                let retData = {
                    code:1,
                    url:"/users/profile"
                }
                return res.send(retData);
            }
    })
}
//编辑----显示数据
function showUser(req,res){
    let retData = {};
    userModel.find({_id:req.params.id},
        function(err,users){
        if(err){
            retData.code = 0;
            retData.msg = err;
            return res.send(retData);
        }
        else{
            retData.code = 1;
            retData.users = users;
            retData.url = "/users/list";
            return res.send(retData);
        }
        }
);
}
//删除
function deleteUser(req,res){
    userModel.remove({_id:req.params.id},
        function(err){
        if(err){console.log(err);}
        else{
            let retData = {
                code:1,
                url:"/users/list"
            }
            return res.send(retData);
        }
        }
    );
}
//新增
function addData(req,res){
    console.log("addUser");
    let user = new userModel({phone:req.body.phone});
    user.set('hashed_password',pubfun.hashPW(req.body.pwd));
    user.set('email',req.body.phone+"@xxx.com");
    
    user.save(function(err) {
        if(err) {
            console.log(err);
        }
        else {
            let retData = {
                code: 1,
                msg: "Success",
                url: '/users/profile'
            };
            req.session.phone = req.body.phone;
            
            return res.send(retData);
        }
    });
}


//具体业务
//注册
function signup(req, res){
    let user = new userModel({phone:req.body.phone});
    user.set('hashed_password',pubfun.hashPW(req.body.pwd));
    user.set('email',req.body.phone+"@xxx.com");
    
    //插入数据到数据库
    user.save(function(err){
        if(err){
            console.log(err);
        }
        else{
            let retData = {
                code:1,
                msg:"success",
                url:'/users/profile'
            };
            req.session.phone = req.body.phone;
            return res.send(retData);
        }
    });
}
//登录
function signin(req,res){
    userModel.find({phone:req.body.phone,'hashed_password':pubfun.hashPW(req.body.pwd)},
        function (err,users) {
            if(err){console.log(err);}
            else{
                var retData = {
                    users:users,
                    code:1,
                    url:"/api/blogs",
                    userName:users[0].userName
                };
                req.session.userName = users[0].userName;
                req.session.picture = users[0].picture;
                req.session.phone = req.body.phone;
                res.send(retData);
            }
        });
}

module.exports = router;

















