/* 预置Cms信息，
 //集合名默认是带s的，但cms这个model已有s所以如果手动插入时不能再加s(也就是说不能是cmss)
 
 use admin
 db.todos.insert(
 {
 classTask: '类别1',
 task: '任务1',
 author: '作者',
 deadline:"截止日期",
 isComplete: '0'
 }
 )
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var todoSchema = new Schema({
    classTask: {type: String},
    task: {type: String,required:true},
    author: {type: String,required:true},
    deadline: {type: String,required:true},
    isComplete: {type:Number,default:0},
    createdAt: {type: Date, default:  (new Date()).valueOf()},
});

var Todo = mongoose.model('Todo',todoSchema);
module.exports = Todo;
