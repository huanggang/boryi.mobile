// http://m.boryi.com/post-nearby-news.htm#oi=9032g19pvbh19g
$(document).ready(function(){

  var baseurl = document.URL;
  var home = baseurl.substring(0, baseurl.lastIndexOf('/')) + "/";
  init();

  function init() {
    var dtoday = new Date();
    dtoday.setHours(0,0,0,0);
    var time = dtoday.getTime() + 1 * 24 * 3600 * 1000;
    dtoday.setTime(time);
    $("#start").val(dtoday.getFullYear() + "/" + (dtoday.getMonth()+1) + "/" + dtoday.getDate());
    time = dtoday.getTime() + 2 * 24 * 3600 * 1000;
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

    // check if the user can post a news
    var url = home + 'php/post_checking.php?oi=' + $("#openid").val() + "&t=4";
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

    // show categories of news
    var map = get_categories_by_parent_id(news_categories, null);
    var option = $("<option />");
    $('#cat_level_1').append(option.clone().attr("value", "0").append("请选择"));
    for (var i = 0; i < map.length; i++){
      var row = option.clone().attr("value", map[i].i.toString()).append(map[i].n);
      $('#cat_level_1').append(row);
    }
  }

  $('#cat_level_1').click(function(event){
    $('#cat_level_1').parent().find(".myerror").remove();
    $('#cat_level_2_div').hide();
    $('#cat_level_2').html("");
    var parent_id = Number($('#cat_level_1 option:selected').val());
    if (parent_id > 0){
      var map = get_categories_by_parent_id(news_categories, parent_id);
      if (map.length > 0){
        $('#cat_level_2_div').show();
        var option = $("<option />");
        $('#cat_level_2').append(option.clone().attr("value", "0").append("请选择"));
        for (var i = 0; i < map.length; i++){
          var row = option.clone().attr("value", map[i].i.toString()).append(map[i].n);
          $('#cat_level_2').append(row);
        }
      }
    }
  });
  $('#cat_level_2').click(function(event){
    $('#cat_level_1').parent().find(".myerror").remove();
  });

  $.validator.addMethod("startdate", function(value, elem, param) {
    var aday = 24 * 3600 * 1000;
    var dtoday = new Date();
    dtoday.setHours(0,0,0,0);
    var dstart = new Date($("#start").val());
    var time = dstart.getTime() - dtoday.getTime();
    return (time >= 0 && time <= (7 * aday));
  }, "起始日期应在7天以内");

  $.validator.addMethod("enddate", function(value, elem, param) {
    var aday = 24 * 3600 * 1000;
    var dstart = new Date($("#start").val());
    var dend = new Date($("#end").val());
    var time = dend.getTime() - dstart.getTime();
    return (time >= 0 && time <= (31 * aday));
  }, "广告讯息有效期至少1天最多31天");

  // the form validator
  var validator = $("#setForm").validate({
    errorPlacement: function(error, element) {
      element.parent().append(error); // default function
    }, 
    rules: { 
      title: { 
        required: true,
        rangelength: [2,128],
      },
      start: {
        required: true,
        date: true,
        startdate: true,
      },
      end: {
        required: true,
        date: true,
        enddate: true,
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
      address: {
        rangelength: [4,256],
      },
    }, 
    messages: { 
      title: { 
        required: "请填写广告讯息标题",
        rangelength: "广告讯息标题至少两个字最长128个字", 
      },
      start: {
        required: "请填写起始日期",
        date: "请输入起始日期：年/月/日",
        startdate: "起始日期应在7天以内",
      },
      end: {
        required: "请填写截止日期",
        date: "请输入截止日期：年/月/日",
        enddate: "广告讯息有效期至少1天最多31天",
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
      $('#content').parent().append(div.clone().append("请填写广告讯息内容"));
    }
    else if (content.length > 512) {
      $("#content").val(content.substr(0, 512));
    }
  }).focusout(function(event){
    $('#content').parent().find(".myerror").remove();
    var div = $('<div/>').addClass('myerror').css("color", "red");
    var content = get_string($("#content").val());
    if (content == null || content.length == 0) {
      $('#content').parent().append(div.clone().append("请填写广告讯息内容"));
    }
    else if (content.length < 4) {
      $('#content').parent().append(div.clone().append("广告讯息内容至少4个字最长512个字"));
    }
    else if (content.length > 512) {
      $("#content").val(content.substr(0, 512));
    }
  });

  $('#setForm').submit(function(event){
    event.preventDefault();
  });

  $('#postNews').click(function(event){
    var valid = true;
    var div = $('<div/>').addClass('myerror').css("color", "red");
    
    // check news category
    $('#cat_level_1').parent().find(".myerror").remove();
    var cat_id = $("#cat_level_2_div").is(":visible") ? Number($('#cat_level_2 option:selected').val()) : Number($('#cat_level_1 option:selected').val());
    if (!(cat_id > 0)){
      valid = false;
      $('#cat_level_1').parent().append(div.clone().append("请选择广告讯息所属类别"));
    }

    // check content
    $('#content').parent().find(".myerror").remove();
    var content = get_string($("#content").val());
    if (content == null){
      valid = false;
      $('#content').parent().append(div.clone().append("请填写广告讯息内容"));
    }
    else if (content.length < 4 || content > 512) {
      valid = false;
      $('#content').parent().append(div.clone().append("广告讯息内容至少4个字最长512个字"));
    }
    // check phone, address
    $('#address').parent().find(".myerror").remove();
    var weixin = get_string($("#weixin").val());
    var qq = get_string($("#qq").val());
    var phone = get_string($("#phone").val());
    var address = get_string($("#address").val());
    if (weixin == null && qq == null && phone == null && address == null) {
      valid = false;
      $('#address').parent().append(div.clone().append("请填写至少一种联系方式"));
    }

    if(validator.form() && valid){
      var openid = get_string($("#openid").val());
      var title = get_string($("#title").val());
      var start = get_string($("#start").val());
      var end = get_string($("#end").val());

      var baseurl = document.URL;
      var url = home + 'php/post_nearby_news.php';
      var params = new Object();
      params.oi = openid;
      params.s = start;
      params.e = end;
      params.t = title;
      params.cid = cat_id;
      params.ct = content;
      if (weixin != null) params.wx = weixin;
      if (qq != null) params.qq = qq;
      if (phone != null) params.phn = phone;
      if (address != null) params.add = address;

      $.post(url, params, 
        function(d) {
          if (d.result){
            window.location.href = home + "nearby-news.htm#oi=" + openid;
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