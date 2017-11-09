//导入依赖
var express = require('express');

var cmsModel = require('../models/cms.js');


var router = express.Router();
//配置路由
router.get('/list',function(req,res){
    // res.render("cms/list");
    if(req.session.role == 'manager'){
        res.render('cms/list',{layout:'manage'});
    }
    else{
        res.render('cms/list');
    }
});
//编辑----显示数据
router.get('/show-cms/:id',showCms);
//删除
router.get('/delete-cms/:id',deleteCms);



router.post('/get-cms-list',getCmsList);
router.post('/save-profile',saveProfile);
//新增
router.post('/add-cms',addCms);

//获取cms列表
function getCmsList(req,res){
    var data = {};
    cmsModel.find({},function(err,cms){
        if(err){console.log(err);}
        else{
            data = {
                code:1,
                cms:cms};
            if(req.session.role){
                data.role = req.session.role;
            }
            return res.send(data);
        }
    });
}
//编辑----显示数据
function showCms(req,res){
    let retData = {};
    cmsModel.find({_id:req.params.id},
        function(err,cms){
            if(err){
                retData.code = 0;
                retData.msg = err;
                return res.send(retData);
            }
            else{
                retData.code = 1;
                retData.cms = cms;
                retData.url = "/cms/list";
                return res.send(retData);
            }
        }
    );
}
//保存数据
function saveProfile(req,res){
    console.log(req.body);
    cmsModel.update({url:req.body.url},
        {$set:{
            classTitle:req.body.classTitle,
            title:req.body.title,
            content:req.body.content,
            author:req.body.author,
            isShow:parseInt(req.body.isShow),
            url:req.body.url,
            createdAt:(new Date()).valueOf(),
            update:true}},
        {upsert:false,multi:false}).exec(function(err,cms){
        if(err){console.log(err)}
        else{
            let retData = {
                code:1,
                url:"/cms/profile"
            }
            return res.send(retData);
        }
    })
}
//删除
function deleteCms(req,res){
    cmsModel.remove({_id:req.params.id},
        function(err){
            if(err){console.log(err);}
            else{
                let retData = {
                    code:1,
                    url:"/cms/list"
                }
                return res.send(retData);
            }
        }
    );
}
//新增
function addCms(req, res) {
    console.log("addCms");
    let cms = new cmsModel({url: req.body.url});
    cms.set('classTitle', req.body.classTitle);
    cms.set('title', req.body.title);
    cms.set('author', req.body.author);
    cms.set('content', req.body.content);
    
    cms.save(function(err) {
        if(err) {
            console.log(err);
        }
        else {
            let retData = {
                code: 1,
                msg: "Success",
                url: '/cms/profile'
            };
            req.session.url = req.body.url;
            
            return res.send(retData);
        }
    });
}







module.exports = router;