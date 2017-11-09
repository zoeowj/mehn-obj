//引入express
var express = require('express');
var credentials = require('../credentials.js');
var emailService = require('../lib/email.js')(credentials);
var svgCaptcha = require('svg-captcha');

var router = express.Router();

//配置路由
router.get('/captcha', function (req, res) {
    var captcha = svgCaptcha.create();
    req.session.captcha = captcha.text;
    
    res.type('svg');
    res.status(200).send(captcha.data);
});
router.get('/', function(req, res){
    //渲染home.hbs,把home.hbs里的内容渲染到母版main.hbs里，替换了其中的{{{body}}}
    res.render("home");
});
router.get('/about', function(req, res){
    res.render("about",{user:"<em>Obama</em>"});
});
router.get('/contact', function(req, res){
    res.render("contact");//{layout:null,data:set}加上这个，所有布局就没有了
});

router.get('/unauthorized',function(req,res){
    res.status(303).render('unauthorized',{layout:null});
});

router.get('/getinfo', function(req, res) {
    var _callback = req.query.callback;
    var  _data = { phone: '(028) 23412234', name: 'Bill Node.js' };
    if ( _callback ){
        res.type('text/javascript');
        res.send(_callback + '(' + JSON.stringify(_data) + ')');
    }
    else{
        res.json(_data);
    }
});


router.post('/send-email', function(req, res){
    emailService.send(req.body.to,req.body.subj,req.body.body);
});



module.exports = router;



















