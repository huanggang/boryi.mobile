$(document).ready(function(){
  	$('form').quickWizard({
      'breadCrumb': false,
    });

    var baseurl = document.URL;
    var home = baseurl.substring(0, baseurl.lastIndexOf('/')) + "/";
    init();

    var university_name;
    function init() {
      var state = 0;
      var hash = window.location.hash;
      if (hash.length > 1){
        hash = hash.slice(1);
        var params = hash.split("&");
        for (var i = 0; i < params.length; i++){
          var pairs = params[i].split("=");
          if (pairs[0] === "oi") {
            $("#openid").val(pairs[1]);
            state++;
          }
          else if (pairs[0] == "k"){
            $("#key").val(pairs[1]);
            state++;
          }
          else if (pairs[0] == "u"){
            university_name = decodeURI(pairs[1]);
            state++;
          }
        }
      }

      document.title = '伯益网--' + university_name;
      $('#banner').html(university_name +'--毕业生调查问卷');

      if (state < 3){
        if (confirm("请先关注伯益网微信公众号：boryi_com，并通过伯益网微信公众号访问此页面。")){
          window.location.href = home;
        }
        else{
          window.location.href = home + "not_found.htm"
        }
      }
    }
    
    var base = "http://m.boryi.com/php/wx/action.php?questionary=1";
    var postInfo = function(form){ 
      var targetUrl = base;
      var info = {
            company: $('#company').val(),
            address: $('#address').val(),
            phone: $('#phone').val(),
            job_title: $('#job_title').val(),
            salary: $('#salary').val(),
            qq: $('#qq').val(),
            mobile: $('#mobile').val(),
            email: $('#email').val(),
            cnt_name: $('#cnt_name').val(),
            cnt_qq: $('#cnt_qq').val(),
            cnt_mobile: $('#cnt_mobile').val(),
            cnt_name1: $('#cnt_name1').val(),
            cnt_qq1: $('#cnt_qq1').val(),
            cnt_mobile1: $('#cnt_mobile1').val(),
            openid: $("#openid").val(),
            key: $("#key").val(),
      }

      $.ajax({
          url: targetUrl,
          type: 'POST',
          data: JSON.stringify(info),
          contentType: 'application/json',
          processData:false
      }).done(function(d) {
          alert('感谢您的参与!');
          //window.location.href = home;
      }).fail(function(xhr, status, msg) {
          alert('网络不太给力，请重试');
      });
    };

    $.validator.addMethod("isRealName", function (value, element) {
        return this.optional(element) || /^[\u4E00-\u9FA5]+$/.test(value);
    }, "包含非法字符");

    $.validator.addMethod("isQQ", function (value, element) {
        return this.optional(element) || /^\s*[1-9][0-9]{4,9}\s*$/.test(value);
    }, "包含非法字符");

    $.validator.addMethod("isMobile", function(value, element) {
      var length = value.length;
      var mobile = /^1[3458]\d{9}$/;
      return this.optional(element) || length == 11 && mobile.exec(value);
    }, "请正确填写您的手机号码");

    // the form validator
    var validator = $("form").validate({
      errorPlacement: function(error, element) {
        element.parent().append(error); // default function
      }, 
      submitHandler: postInfo,
      rules: { 
        company: { 
          required: !0,
          minlength: 2,
          maxlength: 64,
        },
        address: { 
          required: !0,
          minlength: 2,
          maxlength: 256,
        },
        job_title: { 
          required: !0,
          minlength: 2,
          maxlength: 32,
        },
        salary: { 
          required: !0,
          maxlength: 32,
        },
        mobile: { 
          isMobile: !0,
        },
        qq:{
          isQQ: !0,
        },
        email: {
          email: !0,
          maxlength: 32,
        },
        cnt_name: { 
          isRealName: !0,
          maxlength: 16,
        },
        cnt_mobile: { 
          isMobile: !0,
        },
        cnt_qq:{
          isQQ: !0,
        },
        cnt_name1: { 
          isRealName: !0,
          maxlength: 16,
        },
        cnt_mobile1: { 
          isMobile: !0,
        },
        cnt_qq1:{
          isQQ: !0,
        },
      }, 
      messages: {
        company: {
          required: "就业单位名称不能为空",
          minlength: "太短了",
          maxlength: "请不要超过64个字符",
        },
        address: { 
          required: "就业单位地址不能为空",
          minlength: "太短了",
        },
        job_title: { 
          required: "工作岗位/职务不能为空",
          minlength: "太短了",
          maxlength: "不要超过32个字符",
        },
        salary: { 
          required: "工资不能为空",
          maxlength: "最多32个字",
        },
        mobile: { 
          required: "手机号码不能为空",
          isMobile: "请输入正确的手机号",
        },
        qq:{
          isQQ: "请输入正确的QQ号码",
        },
        email:{
          email: "请输入正确的邮箱",
          maxlength: "最多32个字符",
        },
        cnt_name: { 
          isRealName: "请输入正确的姓名",
          maxlength: "最多16个字",
        },
        cnt_mobile: { 
          isMobile: "请输入正确的手机号",
        },
        cnt_qq:{
          isQQ: "请输入正确的QQ号码",
        },
        cnt_name1: { 
          isRealName: "请输入正确的姓名",
          maxlength: "最多16个字",
        },
        cnt_mobile1: { 
          isMobile: "请输入正确的手机号",
        },
        cnt_qq1:{
          isQQ: "请输入正确的QQ号码",
        },
      },
    });
});