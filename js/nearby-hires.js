$(document).ready(function(){

  $('#tab-list').click(tabHandler);
  var tab_detail_disabled = true;

  var baseurl = document.URL;
  var home = baseurl.substring(0, baseurl.lastIndexOf('/')) + "/";
  var page = new Object();
  page.t = 0; // total pages
  page.i = 0; // current page
  page.n = 20; // hires per page
  var position = new Object(); // user GPS positiion
  position.lat = null; // latitude
  position.lng = null; // longitude
  var hires = new Array();

  var html_p = $("<p />").addClass("detail-top").addClass("lh20");
  var html_searching = html_p.clone().attr("id", "searching").append("搜索中...");
  var html_notfound = html_p.clone().attr("id", "notfound").append("附近5公里以内，没有包工信息。");
  var html_prompt = html_p.clone().attr("id", "prompt").append("发布包工信息，获取信用积分。");

  init();

  function init() {
    var openid = null;
    var hash = window.location.hash;
    if (hash.length > 1){
      hash = hash.slice(1);
      var params = hash.split("&");
      for (var i = 0; i < params.length; i++){
        var pairs = params[i].split("=");
        if (pairs[0] === "oi") {
          openid = pairs[1];
          $("#openid").val(openid);
        }
      }
    }
    if (openid == null){
      if (confirm("请先关注伯益网微信公众号：boryi_com，并通过伯益网微信公众号访问此页面。")){
        window.location.href = home + "not_found.htm"
      }
      else{
        window.location.href = home;
      }
    }
    else{
      $(".list").append(html_searching);
      get_hires(openid);
    }
  }

  function get_ids(){
    var obj = new Object();
    var hash = new Array();
    var start = page.i * page.n;
    var end = start + page.n;
    if (end > hires.length){
      end = hires.length;
    }
    var ids = "";
    for (var i = start; i < end; i++){
      var hire = hires[i];
      ids = ids + "," + hire.id;
      var hire_location = new Object();
      hire_location.lat = hire.lat;
      hire_location.lng = hire.lng;
      hire_location.d = hire.d;
      hash[String(hire.id)] = hire_location;
    }
    if (ids.length > 0){
      ids = ids.substr(1);
    }
    obj.ids = ids;
    obj.hash = hash;
    return obj;
  }

  function store_ids(rhires){
    var hs = new Array();
    for (var i = 0; i < rhires.length; i++){
      var rhire = rhires[i];
      if (i < page.n){
        hs.push(rhire);
      }
      var hire = new Object();
      hire.id = rhire.i;
      hire.lat = rhire.lat;
      hire.lng = rhire.lng;
      hire.d = rhire.d;
      hires.push(hire);
    }
    return hs;
  }

  function merge_hires_ids(rhires, hash){
    for (var i = 0; i < rhires.length; i++){
      var rhire = rhires[i];
      var hire_location = hash[String(rhire.i)];
      if (hire_location != null){
        rhire.lat = hire_location.lat;
        rhire.lng = hire_location.lng;
        rhire.d = hire_location.d;
      }
    }
    return rhires;
  }

  function display_hires(rhires){
    $(".list").find("#searching").remove();
    if (rhires.length == 0){
      if (page.i == 1){
        $(".list").append(html_notfound);
        $(".list").append(html_prompt);
      }
    }
    else{
      var li = $("<li />").addClass("list-item");
      var div_row = $("<div />");
      var div_row_fc = div_row.clone().addClass("fc");
      var div_row_fb = div_row_fc.clone().addClass("fb");
      var div_hire = div_row.clone().addClass("list-title fl fb w85");
      var div_duration = div_row.clone().addClass("fr");
      var div_contact = div_row.clone().addClass("fl fb w85");
      var div_distance = div_duration.clone();
      var div_location = div_row.clone().addClass("fl fb w75");
      var div_date = div_duration.clone();
      for (var i = 0; i < rhires.length; i++){
        var rhire = rhires[i];
        var row = li.clone().attr("data-i", rhire.i).attr("data-lat", rhire.lat).attr("data-lng", rhire.lng).attr("data-d", rhire.d).attr("data-s", rhire.s).attr("data-t", rhire.t).attr("data-l", rhire.l).attr("data-dr", rhire.dr).attr("data-c", rhire.c);
        row = row
          .append(div_row.clone().append(div_hire.clone().append(rhire.t)).append(div_duration.clone().append(rhire.dr + "天")))
          .append(div_row_fc.clone().append(div_contact.clone().append(rhire.c)).append(div_distance.clone().append(String(Math.ceil(rhire.d * 100)*10) + "米")))
          .append(div_row_fb.clone().append(div_location.clone().append(rhire.l)).append(div_date.clone().append(rhire.s.slice(0,10))))
          .append(div_row_fc.clone());

        $(".list").append(row);
      }

      if (page.i * page.n < page.t){
        $("#more").show();
      }

      $(".list-item").click(function(event){
        var hire = new Object();
        hire.i = $(this).attr("data-i");
        hire.lat = $(this).attr("data-lat");
        hire.lng = $(this).attr("data-lng");
        hire.d = $(this).attr("data-d");
        hire.s = $(this).attr("data-s");
        hire.t = $(this).attr("data-t");
        hire.l = $(this).attr("data-l");
        hire.dr = $(this).attr("data-dr");
        hire.c = $(this).attr("data-c"); // contact

        get_hire(hire);
      });
    }
  }

  function get_hires(openid){
    // get nearby hires
    var url = home + 'php/get_nearby_hires.php';
    var params = new Object();
    params.oi = openid;
    var hash = null;
    if (page.i > 0){
      var obj = get_ids();
      params.s = obj.ids;
      hash = obj.hash;
    }

    $.post(url, params, 
      function(d) {
        if (d.result != null && d.result == 0){
          alert(hashMap.Get(String(d.error)));
        }
        else {
          page.i += 1;
          var hs = null;
          if (page.i == 1) {// first page
            page.t = d.t;
            position.lat = d.lat;
            position.lng = d.lng;
            hs = store_ids(d.h);
          }
          else{
            hs = merge_hires_ids(d.h, hash);
          }
          display_hires(hs);
        }
    }, "json")
    .fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ", " + error;
      alert( "网络出现问题，请刷新页面。" );
    });
  }

  function merge_hire(rhire, hire){
    hire.e = rhire.e;
    hire.cnt = rhire.c; // content
    hire.wx = rhire.wx;
    hire.qq = rhire.qq;
    hire.phn = rhire.ph;
    hire.eml = rhire.em;
    hire.add = rhire.ad;
    hire.vws = rhire.vw;
    return hire;
  }

  function display_hire(hire){
    $("#complaint-hire-id").val(hire.i);

    $("#title").text(hire.t);
    $("#postdate").text(hire.s.slice(0,10));
    $("#viewed").text(hire.vws == null ? "0" : String(hire.vws));
    $("#location").text(hire.l);
    $("#duration").text(hire.dr);
    $("#description").html(hire.cnt);
    $("#contact").text(hire.c);

    if (hire.wx != null && hire.wx.length > 0){
      $("#weixin-div").show().html("微信：<span>" + hire.wx + "</span>");
    }
    else{
      $("#weixin-div").hide().html("");
    }

    if (hire.qq != null && hire.qq.length > 0){
      $("#qq-div").show().html("QQ号：<span>" + hire.qq + "</span>");
    }
    else{
      $("#qq-div").hide().html("");
    }

    if (hire.phn != null && hire.phn.length > 0){
      var tag_a = '<a href="tel:phone">phone [<span class="call">拨打</span>]</a><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
      var phones = hire.phn.split(",");
      var html_phones = "";
      for (var i = 0; i < phones.length; i++){
        var phone = phones[i];
        html_phones += tag_a.replace(/phone/g, phone);
      }
      if (html_phones.length > 0){
        html_phones = html_phones.substr(0, html_phones.length - 5 - 14*6);
      }
      $("#phone-div").show().html("请联系：" + html_phones);
    }
    else{
      $("#phone-div").hide().html("");
    }

    if (hire.eml != null && hire.eml.length > 0){
      var tag_a = '<a href="mailto:email">email</a><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
      var emails = hire.eml.split(",");
      var html_emails = "";
      for (var i = 0; i < emails.length; i++){
        var email = emails[i];
        html_emails += tag_a.replace(/email/g, email);
      }
      if (html_emails.length > 0){
        html_emails = html_emails.substr(0, html_emails.length - 5 - 14*6);
      }
      $("#email-div").show().html("发邮件：" + html_emails);
    }
    else{
      $("#email-div").hide().html("");
    }

    if (hire.add != null && hire.add.length > 0){
      $("#address-div").show().html("地址：<span>" + hire.add + "</span>");
    }
    else{
      $("#address-div").hide().html("");
    }
    
    var target = new Object();
    target.lng = job.lng;
    target.lat = job.lat;
    target.add = job.add;
    map_click(target);
  }

  function get_hire(hire){
    // get nearby hires
    var url = home + 'php/get_nearby_hire.php';
    var params = new Object();
    params.i = hire.i;

    $.post(url, params, 
      function(d) {
        if (d.result != null && d.result == 0){
          alert(hashMap.Get(String(d.error)));
        }
        else {
          var hs = merge_hire(d, hire);
          display_hire(hs);
          if (tab_detail_disabled){
            $('#tab-detail').click(tabHandler);
            tab_detail_disabled = false;
          }
          $('#tab-detail').click();
        }
    }, "json")
    .fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ", " + error;
      alert( "网络出现问题，请刷新页面。" );
    });
  }

  // operation: complaint
  $('#complaint-btn').click(function(){
    if ($('.complaint-win').is(":visible")) {
      $('.complaint-win').hide("fast");
    }
    else {
      $('.complaint-win').show("slow");
    }
  });

  $(".complaint-type").click(function(){
    $('#complaint-type-5').parent().find(".myerror").remove();
  });

  $("#complaint").keyup(function(event){
    $('#complaint').parent().find(".myerror").remove();
    var div = $('<div/>').addClass('myerror').css("color", "red");
    var complaint = $("#complaint").val();
    if (complaint == null || complaint.trim().length == 0) {
      $('#complaint').parent().append(div.clone().append("请填写举报内容"));
    }
    else if (complaint.trim().length > 256) {
      $("#complaint").val(complaint.trim().substr(0, 256));
    }
  }).focusout(function(event){
    $('#complaint').parent().find(".myerror").remove();
    var div = $('<div/>').addClass('myerror').css("color", "red");
    var complaint = $("#complaint").val();
    if (complaint == null || complaint.trim().length == 0) {
      $('#complaint').parent().append(div.clone().append("请填写举报内容"));
    }
    else if (complaint.trim().length > 256) {
      $("#complaint").val(complaint.trim().substr(0, 256));
    }
  });

  $('#complaint-giveup').click(function(){
    $('.complaint-win').hide("fast");
    $('#complaint-type-5').parent().find(".myerror").remove();
    $('#complaint').parent().find(".myerror").remove();
    $('.complaint-type').removeAttr("checked");
    $('#complaint').val('');
  });

  $('#complaint-submit').click(function(){
    var div = $('<div/>').addClass('myerror').css("color", "red");
    var valid = true;
    $('#complaint-type-5').parent().find(".myerror").remove();
    var complaint_type = Number($(".complaint-type:checked").val());
    if (isNaN(complaint_type) || complaint_type <= 0){
      valid = false;
      $('#complaint-type-5').parent().append(div.clone().append("请选择举报类型"));
    }
    $('#complaint').parent().find(".myerror").remove();
    var complaint = $("#complaint").val();
    if (complaint == null || complaint.trim().length == 0){
      valid = false;
      $('#complaint').parent().append(div.clone().append("请填写举报内容"));
    }
    else {
      complaint = complaint.trim();
      if (complaint > 256) {
        complaint = complaint.substr(0, 256);
      }
    }

    if (valid)
    {
      var openid = $("#openid").val();
      var id = $("#complaint-hire-id").val();

      var url = home + 'php/complaint_hire.php';
      var params = new Object();
      params.oi = openid;
      params.i = id;
      params.t = complaint_type;
      params.c = complaint;

      $.post(url, params, 
        function(d) {
          if (d.result){
            $('.complaint-win').hide("fast");
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

  $('#more').click(function(){
    $(this).hide();
    $(".list").append(html_searching);
    var openid = $("#openid").val();
    get_hires(openid);
  });

});