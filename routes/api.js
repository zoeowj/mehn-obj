var express = require('express');
var blogModel = require('../models/blog.js');
var userModel = require('../models/user.js');
var captchaModel = require('../models/captcha.js');
var validator = require('validator');
var svgCaptcha = require('svg-captcha');
var pubfun    = require('../lib/common.model.js');
var formidable = require('formidable');
var fs = require('fs');
const  AVATAR_UPLOAD_FOLDER = '/avatar/';

var router = express.Router();




router.get('/blogs', function(req, res) {
    res.render("blog/blogs");
});
router.get('/blog-list', getBlogs);
router.get("/update-comment/:commentarr/:id", updateComment);
//用户列表路由
router.get('/get-users-list',getUsersList);
//博客列表路由
router.get('/get-blog-list',getBlogList);
//验证码路由
router.get('/captcha',getCaptcha);

router.get('/profile/:id',getProfile);


router.post('/sure-comment',sureComment);
router.post('/clear-local',clearLocal);
//注册
router.post('/signup',checkPhone,checkPassword,checkCaptcha,signup);
//登录
router.post('/signin',checkCaptcha,signin);
//上传文件
router.post('/upload-profile/:UID/:year/:month/:timestr',uploadProfile);
//保存数据
router.post('/save-profile',saveProfile);



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
//获取博客列表并发送到前端
function getBlogList(req,res){
    var data = {};
    blogModel.find({},function(err,blog){
        if(err){console.log(err);}
        else{
            data = {
                code:1,
                blog:blog};
            if(req.session.role){
                data.role = req.session.role;
            }
            return res.send(data);
        }
    });
}
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
//获取验证码
function getCaptcha(req, res) {
    var text = svgCaptcha.randomText();
    req.session.captcha = text;
    var captcha = svgCaptcha(text);
    
    var _captcha = new captchaModel({captcha: text.trim().toLowerCase()});
    _captcha.save( function(err,data) {
        if(err)
        {
            console.log(err);
        }
        else{
            console.log("data------",data);
        }
    });
    res.set('Content-Type', 'image/svg+xml');
    res.status(200).send(captcha);
}
//检查验证码
function checkCaptcha(req,res,next){
    console.log("captha");
    captchaModel.findOne(
        {captcha: req.body.validation.trim().toLowerCase()},function(err,data){
            if(err){
                console.log(err);
            }
            else
            {
                var retData = {};
                if(data){
                    if( (data.captcha.trim().toLowerCase()) !==
                        (req.body.validation.trim().toLowerCase()))
                    {
                        console.log("=====checkeCaptcha===000000");
                        retData.code = 0;
                        retData.msg = '请检查验证码是否正确！';
                        return res.send(retData);
                    }
                    else{
                        console.log("=====checkeCaptcha===1111111");
                        retData.code = 1;
                        retData.msg = '验证码正确！';
                        next();
                        //return res.send(retData);
                    }
                }
                else
                {
                    console.log("=====checkeCaptcha===22222");
                    retData.code = 0;
                    retData.msg = '请检查验证码是否正确！或你的验证码过期，请点击验证码图片重新获取！';
                    return res.send(retData);
                }
            }
        });
}
//删除之前的验证码
function delCaptcha(){
    captchaModel.remove(
        {createdAt: { $lt : Date.parse(new Date())} },
        function(err){
            if(err)
            {
                console.log(err);
                return  res.send();
            }
        })
}
//查询数据并传递数据到profile视图
function getProfile(req,res){
    
    userModel.find({phone:req.params.id},
        function (err,users) {
            if(err){console.log(err);}
            else{
                var retData = {users:users,code:1}
                var now         = new Date();
                retData.UID     = req.session.phone;
                retData.year    = now.getFullYear();
                retData.month   = now.getMonth();
                retData.timestr = Date.now();
                res.send(retData);
                
            }
        });
    
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
        switch (files.fileUpload.type) {
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
        
        fs.renameSync(files.fileUpload.path, newPath);  //重命名
        //console.log(files.photo.path+"-----"+files.photo.name +"###"+ extName +"==="+req.params.year);
        //console.log('received fields:');
        var imgpath='/avatar_2/'+req.params.timestr+"."+extName;
        updateProfilePicture (req.params.UID,imgpath);
        
        return res.send({url:imgpath});
    
    
    });
}
//更新个人肖像
function updateProfilePicture (UID,imgpath) {
    var data = {};
    console.log("qwewrrrt");
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


//注册
function signup(req, res){
    console.log("signup====");
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
                data:{phone:req.body.phone},
                url:'/users/profile'
            };
            delCaptcha();
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
                    msg:"success",
                    url:"/api/blogs",
                    userName:users[0].userName
                };
                delCaptcha();
                req.session.userName = users[0].userName;
                req.session.phone = req.body.phone;
                req.session.picture = req.body.picture;
                res.send(retData);
            }
        });
}

//获取blog列表
function getBlogs(req, res) {
    var data = {};
    blogModel.find({}, function (err, blog) {
        if(err) {
            data = {
                code: 0,
                msg: err
            };
        }
        else {
            data = {
                code: 1,
                blog: blog
            };
        }
        return res.send(data);
    });
}

//确定评论
function sureComment(req,res){
    console.log("id", req.body.id);
    blogModel.find({_id: req.body.id}, function (err, blog) {
        if(err) {console.log(err)}
        else{
            console.log("blogblog",blog[0]);
            var commentArr = getCommentArr(blog[0].comment, req.body.id, req.body.comment_text,req);
            updateComment(req.body.id, commentArr);
            var retData = {code: 1, url: "/api/blogs"};
            res.send(retData);
        }
    })
}
function updateComment(id, commentArr) {
    blogModel.update({_id: id},
        {$set: {comment: commentArr, update: true}},
        {upsert: false, multi: false}).exec(function(err, blog){
        if(err){
            console.log(err);
        }
        else{
           console.log("update success");
        }
    });
}
function getCommentArr(commentArr, id, msg,req)
{
    var obj = {
        id: id,
        msg: msg,
        picture:req.session.picture,
        userName:req.session.userName
    };
    console.log(commentArr);
    commentArr.push(obj);
    return commentArr;
}
//点击退出，清空本地存储
function clearLocal(req,res){
    req.session.userName = null;
    var retData = {code: 1}
    return res.send(retData);
}

module.exports = router;


















