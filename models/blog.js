/* 预置Blog信息，
 //集合名默认是带s的，但cms这个model已有s所以如果手动插入时不能再加s(也就是说不能是cmss)
 
 use admin
 db.blogs.insert(
 {
 title: '标题',
 content: '内容',
 author:"admin",
 comment:"评论",
 like:"点赞",
 isAuth:"0",
 createdAt:"创建时间"
 }
 )
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
    title: {type: String, required: true},
    content: {type:String},
    author:{type: String, required: true},
    authorPictur:{type:String,required:true},
    comment:{type:Object,default:[]},
    like:{type:Object},
    uv:{type:Object},
    isAuth: {type:Number,default:0},
    createdAt: {type: Date, default:  (new Date()).valueOf()},
});

var Blog = mongoose.model('Blog',blogSchema);
module.exports = Blog;






















