// http://m.boryi.com/post-nearby-job.htm#oi=9032g19pvbh19g&k=02349
$(document).ready(function(){

  var baseurl = document.URL;
  var home = baseurl.substring(0, baseurl.lastIndexOf('/')) + "/";
  init();

  function init() {
    var dtoday = new Date();
    dtoday.setHours(0,0,0,0);
    var time = dtoday.getTime() + 10 * 24 * 3600 * 1000;
    dtoday.setTime(time);
    $("#end").val(dtoday.getFullYear() + "/" + (dtoday.getMonth()+1) + "/" + dtoday.getDate());

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
      }
    }
    if (state == 0){
      if (confirm("请先关注伯益网微信公众号：boryi_com，并通过伯益网微信公众号访问此页面。")){
        window.location.href = home + "not_found.htm"
      }
      else{
        window.location.href = home;
      }
      return;
    }

    // check if the user can post a job
    var url = home + 'php/post_checking.php?oi=' + $("#openid").val() + "&t=2";
    $.getJSON(url, 
      function(d) {
        if (d.result == 0){
          alert(hashMap.Get(String(d.error)));
        }
      })
    .fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ", " + error;
      //alert( "网络出现问题，请重新刷新页面。");
    });
  }

  $.validator.addMethod("enddate", function(value, elem, param) {
    var aday = 24 * 3600 * 1000;
    var dtoday = new Date();
    dtoday.setHours(0,0,0,0);
    var dend = new Date($("#end").val());
    var time = dend.getTime() - dtoday.getTime();
    return (time >= (5 * aday) && time <= (15 * aday));
  }, "职位有效期至少5天最多15天");

  // the form validator
  var validator = $("#setForm").validate({
    errorPlacement: function(error, element) {
      element.parent().append(error); // default function
    }, 
    rules: { 
      titles: { 
        required: true,
        rangelength: [2,32],
      },
      end: {
        required: true,
        date: true,
        enddate: true,
      },
      location: { 
        required: true,
        rangelength: [2,32],
      },
      duration: { 
        required: true,
        digits: true,
        range: [1,1000],
      },
      content: {
        required: true,
        rangelength: [4,512],
      },
      contact: {
        required: true,
        rangelength: [2,64],
      },
      weixin: {
        rangelength: [6,64],
      },
      qq: {
        rangelength: [4,64],
      },
      phone: {
        rangelength: [7,64],
      },
      email: {
        rangelength: [7,64],
      },
      address: {
        rangelength: [4,256],
      },
    }, 
    messages: { 
      titles: { 
        required: "请填写工种名",
        rangelength: "工种名至少两个字最长64个字", 
      },
      end: {
        required: "请填写截止日期",
        date: "请输入截止日期：年/月/日",
        enddate: "职位有效期至少5天最多15天",
      },
      location: { 
        required: "请填写工作地",
        rangelength: "工作地至少两个字最长256个字", 
      },
      duration: {
        required: "请填写包工期",
        digits: "请输入整数",
        range: "包工期应在1天至1000天之间",
      },
      content: { 
        required: "请填写包工描述",
        rangelength: "包工描述至少4个字最长512个字", 
      },
      contact: { 
        required: "请填写雇主名",
        rangelength: "雇主名至少两个字最长32个字", 
      },
      weixin: {
        rangelength: "微信号以空格或逗号分隔，长度应在6至64个字",
      },
      qq: {
        rangelength: "QQ号以空格或逗号分隔，长度应在4至64个字",
      },
      phone: {
        rangelength: "电话以空格或逗号分隔，长度应在7至64个字",
      },
      email: {
        rangelength: "邮箱以空格或逗号分隔，长度应在7至64个字",
      },
      address: {
        rangelength: "地址长度应在4至256个字",
      },
    },
  });

  $("#content").keyup(function(event){
    $('#content').parent().find(".myerror").remove();
    var div = $('<div/>').addClass('myerror').css("color", "red");
    var content = get_string($("#content").val());
    if (content == null || content.length == 0) {
      $('#content').parent().append(div.clone().append("请填写包工描述"));
    }
    else if (content.length > 512) {
      $("#content").val(content.substr(0, 512));
    }
  }).focusout(function(event){
    $('#content').parent().find(".myerror").remove();
    var div = $('<div/>').addClass('myerror').css("color", "red");
    var content = get_string($("#content").val());
    if (content == null || content.length == 0) {
      $('#content').parent().append(div.clone().append("请填写包工描述"));
    }
    else if (content.length < 4) {
      $('#content').parent().append(div.clone().append("包工描述至少4个字最长512个字"));
    }
    else if (content.length > 512) {
      $("#content").val(content.substr(0, 512));
    }
  });

  $('#setForm').submit(function(event){
    event.preventDefault();
  });

  $('#postHire').click(function(event){
    var valid = true;
    var div = $('<div/>').addClass('myerror').css("color", "red");

    // check content
    $('#content').parent().find(".myerror").remove();
    var content = get_string($("#content").val());
    if (content == null){
      valid = false;
      $('#content').parent().append(div.clone().append("请填写包工描述"));
    }
    else if (content.length < 4 || content > 512) {
      valid = false;
      $('#content').parent().append(div.clone().append("包工描述至少4个字最长512个字"));
    }
    // check phone, email, address
    $('#address').parent().find(".myerror").remove();
    var weixin = get_string($("#weixin").val());
    var qq = get_string($("#qq").val());
    var phone = get_string($("#phone").val());
    var email = get_string($("#email").val());
    var address = get_string($("#address").val());
    if (weixin == null && qq == null && phone == null && email == null && address == null) {
      valid = false;
      $('#address').parent().append(div.clone().append("请填写至少一种联系方式"));
    }

    if(validator.form() && valid){
      var openid = get_string($("#openid").val());
      var titles = get_string($("#titles").val());
      var end = get_string($("#end").val());
      var location = get_string($("#location").val());
      var duration = get_number($("#duration").val());
      var contact = get_string($("#contact").val());

      var baseurl = document.URL;
      var url = home + 'php/post_nearby_hire.php';
      var params = new Object();
      params.oi = openid;
      params.e = end;
      params.t = titles;
      params.l = location;
      params.dur = duration;
      params.c = content;
      params.cnt = contact;
      if (weixin != null) params.wx = weixin;
      if (qq != null) params.qq = qq;
      if (phone != null) params.phn = phone;
      if (email != null) params.eml = email;
      if (address != null) params.add = address;

      $.post(url, params, 
        function(d) {
          if (d.result){
            window.location.href = home + "nearby-hires.htm#oi=" + openid;
          }
          else {
            alert(hashMap.Get(String(d.error)));
          }
      }, "json")
      .fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        alert( "网络出现问题，请刷新页面。" );
      });
    }
  });

  function get_number(value){
    value = get_string(value);
    if (value == null){
      return null;
    }
    try{
      value = Number(value);
      if (isNaN(value)){
        return null;
      }
      return value;
    }
    catch (e){}
    return null;
  }

  function get_string(value){
    if (value == null){
      return null;
    }
    value = value.trim();
    if (value.length == 0){
      return null;
    }
    return value;
  }

});