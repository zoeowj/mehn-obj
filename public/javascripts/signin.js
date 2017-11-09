//    登录验证
function validatorSignInForm() {
    var ret = true;
    if(!validator.isMobilePhone($("#phone").val(),"zh-CN")){
        ret = false;
        alert("手机号不正确");
        $("#phone").focus();
        return false;
    }
    if(!validator.isLength($("#pwd").val(),{min:6, max: 20})){
        ret = false;
        alert("请输入6~20密码");
        $("#pwd").focus();
        return false;
    }
    if(ret){
        signin();
    }
}
function signin() {
    //将表单数据序列化
    var para = $("#signInform").serialize();
    alert(para);
    $.ajax(
        {
            url:'/users/signin',
            type:'POST',
            async:true,
            data:para,
            success:function (res) {
            console.log(res);
                if(parseInt(res.code) === 1) {
                    localStorage.setItem('userName',res.userName);
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

