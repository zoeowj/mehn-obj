//导入依赖
var express = require('express');

var todoModel = require('../models/todo.js');

var router = express.Router();
//配置路由
router.get('/list',function(req,res){
    res.render("todo/list");
});
//点击编辑----显示数据
router.get('/show-todo/:id',showTodo);
//删除
router.get('/delete-todo/:id',deleteTodo);



router.post('/get-todo-list',getTodoList);
router.post('/save-profile',saveProfile);


//获取todo列表
function getTodoList(req,res){
    var data = {};
    todoModel.find({},function(err,todo){
        if(err){console.log(err);}
        else{
            data = {
                code:1,
                todo:todo};
            console.log("todo", todo);
            return res.send(data);
        }
    });
}
//编辑----显示数据
function showTodo(req,res){
    let retData = {};
    todoModel.find({_id:req.params.id},
        function(err,todo){
            if(err){
                retData.code = 0;
                retData.msg = err;
                return res.send(retData);
            }
            else{
                retData.code = 1;
                retData.todo = todo;
                retData.url = "/todo/list";
                return res.send(retData);
            }
        }
    );
}
//保存数据
function saveProfile(req,res){
    console.log(req.body);
    todoModel.update({_id:req.body.id},
        {$set:{
            classTask:req.body.classTask,
            task:req.body.task,
            author:req.body.author,
            deadline:req.body.deadline,
            isComplete:parseInt(req.body.isComplete),
            update:true}},
        {upsert:false,multi:false}).exec(function(err,todo){
        if(err){console.log(err)}
        else{
            let retData = {
                code:1,
                url:"/todo/profile"
            }
            return res.send(retData);
        }
    })
}
//删除
function deleteTodo(req,res){
    todoModel.remove({_id:req.params.id},
        function(err){
            if(err){console.log(err);}
            else{
                let retData = {
                    code:1,
                    url:"/todo/list"
                }
                return res.send(retData);
            }
        }
    );
}
















module.exports = router;