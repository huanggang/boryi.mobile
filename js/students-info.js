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
      if (hash.length <= 1){
        hash = window.location.href;
        var index = hash.indexOf('?%23');
        if (index >= 0){
          hash = hash.substring(hash.indexOf('?%23')+3);
        }
        else{
          index = hash.indexOf('?');
          if (index >= 0){
            hash = hash.substring(hash.indexOf('?'));
          }
        }
      }
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

      document.title = '伯益校园招聘之' + university_name;
      $('#banner').html(university_name +'--学生信息表');

      if (state < 3){
        if (confirm("请先关注伯益网微信公众号：boryi_com，并通过伯益网微信公众号访问此页面。")){
          window.location.href = home;
        }
        else{
          window.location.href = home + "not_found.htm"
        }
      }
    }

    $('#dob').change(function(){
      var val = $(this, 'option:selected').val();
      if (val > 0){
        $('#dob-m').show();
      } else {
        $('#dob-m').hide();
      }
    });

    var base = "http://m.boryi.com/php/wx/action.php?info=1";
    var postInfo = function(form){ 
      var targetUrl = base;
      var dob_val = $('#dob option:selected').val();
      if (dob_val > 0){
        dob_val += '-' + $('#dob-m option:selected').val();
      }
      
      var info = {
        sid: $('#sid').val(),
        sname: $('#sname').val(),
        gender: $('input[name=gender]:checked').val(),
        dob: dob_val,
        enrolled: $('#enrolled option:selected').val(),
        graduated: $('#graduated').val(),
        college: $('#college').val(),
        department: $('#department').val(),
        major: $('#major').val(),
        class: $('#class').val(),
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
          if (confirm('录入成功，感谢您的配合。')){
            window.close();
          }
          //window.location.href = home;
      }).fail(function(xhr, status, msg) {
          alert('无法连接到服务器，请重新提交。');
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

    var is_required = true;
    // the form validator
    var validator = $("form").validate({
      errorPlacement: function(error, element) {
        element.parent().append(error); // default function
      }, 
      submitHandler: postInfo,
      rules: { 
        sid: { 
          required: is_required,
          minlength: 6,
        },
        sname: { 
          required: is_required,
          isRealName: true,
          minlength: 2,
        },
        graduated: { 
          required: is_required,
        },
        mobile: { 
          required: is_required,
          isMobile: true,
        },
        qq:{
          isQQ: true,
        },
        email: {
          email: true,
          maxlength: 32,
        },
        cnt_name: { 
          isRealName: true,
        },
        cnt_mobile: { 
          isMobile: true,
        },
        cnt_qq:{
          isQQ: true,
        },
        cnt_name1: { 
          isRealName: true,
        },
        cnt_mobile1: { 
          isMobile: true,
        },
        cnt_qq1:{
          isQQ: true,
        },
      }, 
      messages: { 
        sid: { 
          required: "学号不能为空",
          minlength: "学号太短",
        },
        sname: { 
          required: "姓名不能为空",
          isRealName: "请输入正确的姓名",
          minlength: "请输入全名",
        },
        graduated: { 
          required: "毕业年份不能为空",
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