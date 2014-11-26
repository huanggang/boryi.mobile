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

      document.title = '伯益网--' + university_name;
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

    var collages = [
      {id:1,name:"林学院"},
      {id:2,name:"生命科学与技术学院"}, 
      {id:3,name:"材料科学与工程学院"}, 
      {id:4,name:"交通运输与物流学院"},
      {id:5,name:"机电工程学院"}, 
      {id:6,name:"风景园林学院"}, 
      {id:7,name:"家具与艺术设计学院"}, 
      {id:8,name:"计算机与信息工程学院"}, 
      {id:9,name:"土木工程与力学学院"}, 
      {id:10,name:"商学院"}, 
      {id:11,name:"外国语学院"}, 
      {id:12,name:"旅游学院"}, 
      {id:13,name:"食品科学与工程学院"}, 
      {id:14,name:"理学院"}, 
      {id:15,name:"政法学院"}, 
      {id:16,name:"经济学院"}, 
      {id:17,name:"班戈学院"}, 
      {id:18,name:"体育学院"}, 
      {id:19,name:"音乐系"}, 
      {id:20,name:"思想政治理论课教学部"}, 
      {id:21,name:"继续教育学院"}, 
      {id:22,name:"国际学院"}, 
      {id:23,name:"涉外学院"},
    ];

    setSelections(collages, 'college', null, true);

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
        college: $('#college option:selected').html(),
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
          alert('录入成功!');
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