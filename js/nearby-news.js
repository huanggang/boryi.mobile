$(document).ready(function(){

  $('#tab-list').click(tabHandler);
  var tab_detail_disabled = true;

  var baseurl = document.URL;
  var home = baseurl.substring(0, baseurl.lastIndexOf('/')) + "/";
  var page = new Object();
  page.t = 0; // total pages
  page.i = 0; // current page
  page.n = 20; // news per page
  var position = new Object(); // user GPS positiion
  position.lat = null; // latitude
  position.lng = null; // longitude
  var newss = new Array();

  var html_p = $("<p />").addClass("detail-top").addClass("lh20");
  var html_searching = html_p.clone().attr("id", "searching").append("搜索中...");
  var html_notfound = html_p.clone().attr("id", "notfound").append("附近5公里以内，没有广告讯息。");
  var html_prompt = html_p.clone().attr("id", "prompt").append("发布广告讯息，获取信用积分。");

  var map_categories = get_cat_att_map(news_categories);

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
      get_newss(openid, null);
    }

    // show categories of news
    var map = get_categories_by_parent_id(news_categories, null);
    var option = $("<option />");
    $('#cat_level_1').append(option.clone().attr("value", "0").append("请选择"));
    for (var i = 0; i < map.length; i++){
      var row = option.clone().attr("value", map[i].i.toString()).append(map[i].n);
      $('#cat_level_1').append(row);
    }

    $("#expand-search").click(function(event){
      if ($("#search-block").is(":visible")){
        $(this).text("展开搜索");
        $("#search-block").hide();
      }
      else{
        $(this).text("收起搜索");
        $("#search-block").show();
      }
    });

    $('#cat_level_1').click(function(event){
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

    // search button
    $("#search").click(function(event){
      var cat_id_1 = Number($('#cat_level_1 option:selected').val());
      var cat_id_2 = Number($('#cat_level_2 option:selected').val());
      var cat_id = cat_id_2 > 0 ? cat_id_2 : cat_id_1;
      if (!(cat_id > 0)){
        cat_id = null;
      }
      else{
        var openid = $("#openid").val();
        $("#category_id").val(String(cat_id));
        get_newss(openid, cat_id);
        $("#expand-search").click();
      }
    });
  }

  function get_ids(){
    var obj = new Object();
    var hash = new Array();
    var start = page.i * page.n;
    var end = start + page.n;
    if (end > newss.length){
      end = newss.length;
    }
    var ids = "";
    for (var i = start; i < end; i++){
      var news = newss[i];
      ids = ids + "," + news.id;
      var news_location = new Object();
      news_location.lat = news.lat;
      news_location.lng = news.lng;
      news_location.d = news.d;
      hash[String(news.id)] = news_location;
    }
    if (ids.length > 0){
      ids = ids.substr(1);
    }
    obj.ids = ids;
    obj.hash = hash;
    return obj;
  }

  function store_ids(rnewss){
    var ns = new Array();
    for (var i = 0; i < rnewss.length; i++){
      var rnews = rnewss[i];
      if (i < page.n){
        ns.push(rnews);
      }
      var news = new Object();
      news.id = rnews.i;
      news.lat = rnews.lat;
      news.lng = rnews.lng;
      news.d = rnews.d;
      newss.push(news);
    }
    return ns;
  }

  function merge_newss_ids(rnewss, hash){
    for (var i = 0; i < rnewss.length; i++){
      var rnews = rnewss[i];
      var news_location = hash[String(rnews.i)];
      if (news_location != null){
        rnews.lat = news_location.lat;
        rnews.lng = news_location.lng;
        rnews.d = news_location.d;
      }
    }
    return rnewss;
  }

  function display_newss(rnewss){
    $(".list").find("#searching").remove();
    if (rnewss.length == 0){
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
      var div_news = div_row.clone().addClass("list-title fb");
      var div_distance = div_row.clone().addClass("fr");
      var div_category = div_row.clone().addClass("fl fb w85");
      var div_valid_date = div_row.clone().addClass("fb");
      for (var i = 0; i < rnewss.length; i++){
        var rnews = rnewss[i];
        var row = li.clone().attr("data-i", rnews.i).attr("data-lat", rnews.lat).attr("data-lng", rnews.lng).attr("data-d", rnews.d).attr("data-c", rnews.c).attr("data-t", rnews.t).attr("data-s", rnews.s).attr("data-e", rnews.e);
        row = row
          .append(div_row.clone().append(div_news.clone().append(rnews.t)))
          .append(div_row_fc.clone().append(div_category.clone().append(map_categories[String(rnews.c)])).append(div_distance.clone().append(String(Math.ceil(rnews.d * 100)*10) + "米")))
          .append(div_row_fb.clone().append(div_valid_date.clone().append("有效期：" + rnews.s.slice(0,10) + " ~ " + news.e.slice(0,10))))
          .append(div_row_fc.clone());

        $(".list").append(row);
      }

      if (page.i * page.n < page.t){
        $("#more").show();
      }

      $(".list-item").click(function(event){
        var news = new Object();
        news.i = $(this).attr("data-i");
        news.lat = $(this).attr("data-lat");
        news.lng = $(this).attr("data-lng");
        news.d = $(this).attr("data-d");
        news.c = $(this).attr("data-c");
        news.t = $(this).attr("data-t");
        news.s = $(this).attr("data-s");
        news.e = $(this).attr("data-e");

        get_news(news);
      });
    }
  }

  function get_newss(openid, category_id){
    // get nearby newss
    var url = home + 'php/get_nearby_newss.php';
    var params = new Object();
    params.oi = openid;
    if (category_id != null && category_id > 0) params.ci = category_id;
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

  function merge_news(rnews, news){
    news.p = rnews.p;
    news.ct = rnews.ct; // content
    news.pt = rnews.pt; // photo
    news.wx = rnews.wx;
    news.qq = rnews.qq;
    news.phn = rnews.phn;
    news.add = rnews.add;
    news.vws = rnews.vws;
    return news;
  }

  function display_news(news){
    $("#complaint-news-id").val(news.i);

    $("#title").text(news.t);
    $("#validdate").text(news.s.slice(0,10) + " ~ " + news.e.slice(0,10));
    $("#postdate").text(news.p.slice(0,10));
    $("#viewed").text(news.vws == null ? "0" : String(news.vws));

    if (news.ct != null && news.ct.length > 0){
      $("#content-block").show();
      $("#content").html(news.ct);
    }
    else{
      $("#content-block").hide();
      $("#content").html("");
    }

    if (news.wx != null && news.wx.length > 0){
      $("#weixin-div").show().html("微信：<span>" + news.wx + "</span>");
    }
    else{
      $("#weixin-div").hide().html("");
    }

    if (news.qq != null && news.qq.length > 0){
      $("#qq-div").show().html("QQ ：<span>" + news.qq + "</span>");
    }
    else{
      $("#qq-div").hide().html("");
    }

    if (news.phn != null && news.phn.length > 0){
      var tag_a = '<a href="tel:phone">phone [<span class="call">拨打</span>]</a><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
      var phones = news.phn.split(",");
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

    if (news.add != null && news.add.length > 0){
      $("#address-div").show().html("地址：<span>" + news.add + "</span>");
    }
    else{
      $("#address-div").hide().html("");
    }
    
    var target = new Object();
    target.lng = news.lng;
    target.lat = news.lat;
    target.add = news.add;
    map_click(target);
  }

  function get_news(news){
    // get nearby news
    var url = home + 'php/get_nearby_news.php';
    var params = new Object();
    params.i = news.i;

    $.post(url, params, 
      function(d) {
        if (d.result != null && d.result == 0){
          alert(hashMap.Get(String(d.error)));
        }
        else {
          var ns = merge_news(d, news);
          display_news(ns);
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
      var id = $("#complaint-news-id").val();

      var url = home + 'php/complaint_news.php';
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
    var category_id = Number($("#category_id").val());
    if (!(category_id > 0)) category_id = null;
    get_newss(openid, category_id);
  });

});