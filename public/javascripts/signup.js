//输入框初始状态
var phonestatus = false,
    pwdstatus = false,
    repwdstatus = false,
    validatestatus = false;
//点击注册按钮
$("#btn-signup").click(function(){
    if(phonestatus&&pwdstatus&&repwdstatus&&validatestatus){
        signup();
    }
    });
//输入手机号输入框失去焦点
$("#phone").blur(function(){
    phonestatus = false;
    if(!validator.isMobilePhone($("#phone").val(),"zh-CN")){
        $("#errorMsg-phone").css("display","block");
        // $("#phone").focus();
        return false;
    }
    else{
        phonestatus = true;
        $("#errorMsg-phone").css("display","none");
    }
});
//输入密码输入框失去焦点
$("#password").blur(function(){
    pwdstatus = false;
    if(!validator.isLength($("#password").val(),{min:6, max: 20})){
        $("#errorMsg-pwd").css("display","block");
        // $("#password").focus();
        return false;
    }
    else{
        pwdstatus = true;
        $("#errorMsg-pwd").css("display","none");
    }
});
//确认密码输入框失去焦点
$("#repassword").blur(function(){
    repwdstatus = false;
    if($("#repassword").val() !== $("#password").val()){
        $("#errorMsg-repwd").css("display","block");
        // $("#repassword").focus();
        return false;
    }
    else{
        repwdstatus = true;
        $("#errorMsg-repwd").css("display","none");
    }
});
//验证码输入框失去焦点
$("#inputValidate").blur(function(){
    validatestatus = false;
    if($("#inputValidate").val().length !== 4){
        $("#errorMsg-validate").css("display","block");
        $("#errorMsg-validate").text("验证码输入错误！");
        // $("#inputValidate").focus();
        return false;
    }
    else{
        validatestatus = true;
        $("#errorMsg-validate").css("display","none");
    }
});

// 注册验证
/*function validatorSignUpForm() {
    var ret = true;
    if(!validator.isMobilePhone($("#phone").val(),"zh-CN")){
        ret = false;
        // alert("手机号不正确");
        $("#phone").focus();
        return false;
    }
    if(!validator.isLength($("#password").val(),{min:6, max: 20})){
        ret = false;
        // alert("请输入6~20密码");
        $("#password").focus();
        return false;
    }
    if($("#password").val() !== $("#repassword").val()){
        ret = false;
        // alert("两次密码输入不一致！");
        $("#repassword").focus();
        return false;
    }
    if($("#inputValidate").val().length !== 4){
        ret = false;
        // alert("验证码输入错误!");
        $("#inputValidate").focus();
        return false;
    }
    if(ret){
        signup();
    }
}*/
// ajax请求
function signup(){
    var para = $("#signUpform").serialize();
    alert(para);
    $.ajax(
        {
            url:'/users/signup',
            type:'POST',
            async:true,
            data:para,
            success:function (res) {
                if(parseInt(res.code) === 0){
                    $("#" + res.id).css("display", "block");
                    $("#" + res.id).text(res.msg);
                }
                // console.log(res);
                if(parseInt(res.code) === 1){
                    // console.log(res);
                   window.location.href = res.url;
                }
            }
        }
    );
}

//点击刷新验证码
$("#vCode").click(function(e){
        //阻止默认事件
        e.preventDefault();
        var captchaUrl = '/captcha?t='+Date.now()+Math.random();
        $("#captchaImg").attr("src",captchaUrl);
})
























