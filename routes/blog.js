//导入依赖
var express = require('express');

var blogModel = require('../models/blog');

var router = express.Router();
//配置路由
router.get('/list',function(req,res){
    // res.render("blog/list");
    if(req.session.role == 'manager'){
        res.render('blog/list',{layout:'manage'});
    }
    else{
        res.render('blog/list');
    }
});
//点击编辑----显示数据
router.get('/show-blog/:id',showBlog);
//删除
router.get('/delete-blog/:id',deleteBlog);
//获取详细页面
router.get('/detail-list/:id',detailList);



router.post('/get-blog-list',getBlogList);
router.post('/save-profile',saveProfile);
//新增
router.post('/add-blog',addBlog);


//获取blog列表
function getBlogList(req,res){
    /*var blog = new blogModel({title: "Title3"});
    blog.set({author: "lm"});
    blog.save(function (err) {
        if(err) {console.log(err)}
        else{
            var retData = {code: 1};
            return res.send(retData);
        }
    })*/
    var data = {};
    blogModel.find({},function(err,blog){
        if(err){console.log(err);}
        /*else{
            data = {
                code:1,
                blog:blog};
            console.log("blog", blog);
            return res.send(data);
        }*/
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
//编辑----显示数据
function showBlog(req,res){
    let retData = {};
    blogModel.find({_id:req.params.id},
        function(err,blog){
            if(err){
                retData.code = 0;
                retData.msg = err;
                return res.send(retData);
            }
            else{
                retData.code = 1;
                retData.blog = blog;
                retData.url = "/blog/list";
                return res.send(retData);
            }
        }
    );
}
//保存数据
function saveProfile(req,res){
    console.log(req.body);
    blogModel.update({title:req.body.title},
        {$set:{
            title:req.body.title,
            content:req.body.content,
            author:req.body.author,
            comment:req.body.comment,
            like:req.body.like,
            isAuth:parseInt(req.body.isAuth),
            createdAt:(new Date()).valueOf(),
            update:true}},
        {upsert:false,multi:false}).exec(function(err,todo){
        if(err){console.log(err)}
        else{
            let retData = {
                code:1,
                url:"/blog/profile"
            }
            return res.send(retData);
        }
    })
}
//删除
function deleteBlog(req,res){
    blogModel.remove({_id:req.params.id},
        function(err){
            if(err){console.log(err);}
            else{
                let retData = {
                    code:1,
                    url:"/blog/list"
                }
                return res.send(retData);
            }
        }
    );
}
//新增
function addBlog(req,res){
    console.log("addCms");
    let blog = new blogModel({author: req.body.author});
    blog.set('title', req.body.title);
    blog.set('content', req.body.content);
    blog.set('comment', req.body.comment);
    blog.set('like', req.body.like);
    blog.set('isAuth', req.body.isAuth);
    blog.set('createdAt', (new Date()).valueOf());
    
    blog.save(function(err) {
        if(err) {
            console.log(err);
        }
        else {
            let retData = {
                code: 1,
                msg: "Success",
                url: '/blog/profile'
            };
            req.session.author = req.body.author;
            
            return res.send(retData);
        }
    });
}
//查询详细页面内容
function detailList(req,res){
    console.log("id", req.params.id);
    blogModel.find({_id:req.params.id},function(err,blog){
        if(err){console.log(err);}
        else{
            if(blog.length > 0)
            {
                res.render("blog/detail", blog[0]);
            }
        }
    })
}



module.exports = router;

