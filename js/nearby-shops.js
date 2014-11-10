$(document).ready(function(){
  $('#tab-list').click(tabHandler);
  $('#back').click(function(event){
    hideSaveMessage();
    if ($('#tab-list').hasClass("ui-tab-item-current")){
      $('#tab-detail').click();
    }
    else {
      $('#tab-list').click();
    }
  });
  var tab_detail_disabled = true;

  var baseurl = document.URL;
  var home = baseurl.substring(0, baseurl.lastIndexOf('/')) + "/";
  var page = new Object();
  page.t = 0; // total pages
  page.i = 0; // current page
  page.n = 20; // shop per page
  var position = new Object(); // user GPS positiion
  position.lat = null; // latitude
  position.lng = null; // longitude
  var shops = new Array();

  var html_p = $("<p />").addClass("detail-top").addClass("lh20");
  var html_searching = html_p.clone().attr("id", "searching").append("搜索中...");
  var html_notfound = html_p.clone().attr("id", "notfound").append("附近5公里以内，没有商家信息。");
  var html_prompt = html_p.clone().attr("id", "prompt").append("发布商家信息，获取信用积分。");

  var map_categories = {
    Set : function(key,value){this[key] = value},
    Get : function(key){return this[key]},
    Size: function(){var t = 0; for(var k in this) t++; return t},
  };
  get_cat_att_map(shop_categories, map_categories);

  init();
  init_edit_win();

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
      get_shops(openid, null, null, null);
    }

    // show categories of shop
    var map = get_categories_by_parent_id(shop_categories, null);
    var option = $("<option />");
    $('#cat_level_1').append(option.clone().attr("value", "0").append("请选择"));
    for (var i = 0; i < map.length; i++){
      var row = option.clone().attr("value", map[i].i.toString()).append(map[i].n);
      $('#cat_level_1').append(row);
    }

    $("#expand-search").click(function(event){
      if ($("#search-block").is(":visible")){
        $(this).text("+ 展开搜索");
        $("#search-block").hide();
      }
      else{
        $(this).text("- 收起搜索");
        $("#search-block").show();
      }
    });

    $('#cat_level_1').click(function(event){
      $('#cat_level_2_div').hide();
      $('#cat_level_2').html("");
      $('#cat_level_3_div').hide();
      $('#cat_level_3').html("");
      var parent_id = Number($('#cat_level_1 option:selected').val());
      if (parent_id > 0){
        var map = get_categories_by_parent_id(shop_categories, parent_id);
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
      $('#cat_level_3_div').hide();
      $('#cat_level_3').html("");
      var parent_id = Number($('#cat_level_2 option:selected').val());
      if (parent_id > 0){
        var map = get_categories_by_parent_id(shop_categories, parent_id);
        if (map.length > 0){
          $('#cat_level_3_div').show();
          var option = $("<option />");
          $('#cat_level_3').append(option.clone().attr("value", "0").append("请选择"));
          for (var i = 0; i < map.length; i++){
            var row = option.clone().attr("value", map[i].i.toString()).append(map[i].n);
            $('#cat_level_3').append(row);
          }
        }
      }
    });

    // search button
    $("#search").click(function(event){
      var old_cat_id = Number($("#category_id").val());
      if (!(old_cat_id > 0)) old_cat_id = null;
      var cat_id_1 = Number($('#cat_level_1 option:selected').val());
      var cat_id_2 = Number($('#cat_level_2 option:selected').val());
      var cat_id_3 = Number($('#cat_level_3 option:selected').val());
      var cat_id = cat_id_3 > 0 ? cat_id_3 : (cat_id_2 > 0 ? cat_id_2 : cat_id_1);
      if (!(cat_id > 0)) cat_id = null;

      var old_keyword = $('#keyword_s').val();
      if (old_keyword != null && old_keyword.trim().length == 0) old_keyword = null;
      var keyword = $('#keyword').val();
      if (keyword != null && keyword.trim().length == 0) keyword = null;
      else keyword = keyword.trim();

      var old_restroom = Number($('#restroom_s').val());
      if (old_restroom != 1) old_restroom = null;
      var restroom = Number($('#restroom:checked').val());
      if (restroom != 1) restroom = null;

      if (old_cat_id != cat_id || old_keyword != keyword || old_restroom != restroom){
        var openid = $("#openid").val();
        $("#category_id").val(cat_id > 0 ? String(cat_id) : "0");
        $("#keyword_s").val(keyword != null ? keyword : "");
        $("#restroom_s").val(restroom == 1 ? "1" : "0");
        $(".list").html("").append(html_searching);
        get_shops(openid, cat_id, keyword, restroom);
        $("#expand-search").click();
      }
    });
  }

  function get_ids(){
    var obj = new Object();
    var hash = new Object();
    var start = page.i * page.n;
    var end = start + page.n;
    if (end > shops.length){
      end = shops.length;
    }
    var ids = "";
    for (var i = start; i < end; i++){
      var shop = shops[i];
      ids = ids + "," + shop.id;
      var shop_location = new Object();
      shop_location.lat = shop.lat;
      shop_location.lng = shop.lng;
      shop_location.d = shop.d;
      hash[String(shop.id)] = shop_location;
    }
    if (ids.length > 0){
      ids = ids.substr(1);
    }
    obj.ids = ids;
    obj.hash = hash;
    return obj;
  }

  function store_ids(rshops){
    var ss = new Array();
    for (var i = 0; i < rshops.length; i++){
      var rshop = rshops[i];
      if (i < page.n){
        ss.push(rshop);
      }
      var shop = new Object();
      shop.id = rshop.i;
      shop.lat = rshop.lat;
      shop.lng = rshop.lng;
      shop.d = rshop.d;
      shops.push(shop);
    }
    return ss;
  }

  function merge_shops_ids(rshops, hash){
    for (var i = 0; i < rshops.length; i++){
      var rshop = rshops[i];
      var shop_location = hash[String(rshop.i)];
      if (shop_location != null){
        rshop.lat = shop_location.lat;
        rshop.lng = shop_location.lng;
        rshop.d = shop_location.d;
      }
    }
    return rshops;
  }

  function display_shops(rshops){
    $(".list").find("#searching").remove();
    if (rshops.length == 0){
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
      var div_shop = div_row.clone().addClass("list-title fb");
      var div_category = div_row.clone().addClass("fl fb w85");
      var div_distance = div_row.clone().addClass("fr");
      var div_attribute = div_row.clone().addClass("fb");
      var div_comments = div_row.clone().addClass("fl");
      var div_restroom = div_row.clone().addClass("fr").append("公共洗手间");

      for (var i = 0; i < rshops.length; i++){
        var rshop = rshops[i];
        var row = li.clone().attr("data-i", rshop.i).attr("data-lat", rshop.lat).attr("data-lng", rshop.lng).attr("data-d", rshop.d).attr("data-c", rshop.c).attr("data-n", rshop.n).attr("data-r", rshop.r).attr("data-a", rshop.a).attr("data-s5", rshop.s5).attr("data-s4", rshop.s4).attr("data-s3", rshop.s3).attr("data-s2", rshop.s2).attr("data-s1", rshop.s1);
        row = row
          .append(div_row.clone().append(div_shop.clone().append(rshop.n)))
          .append(div_row_fc.clone().append(div_category.clone().append(map_categories.Get(String(rshop.c)))).append(div_distance.clone().append(String(Math.ceil(rshop.d * 100)*10) + "米")));
        var attributes = get_attributes(rshop.a);
        if (attributes != null){
          row = row.append(div_row_fb.clone().append(div_attribute.clone().append(attributes)));
        }
        var comments = get_comment_avg_points(rshop.s5, rshop.s4, rshop.s3, rshop.s2, rshop.s1);
        if (comments.total > 0){
          row = row
            .append(div_row_fb.clone().append(div_comments.clone().append("评分：" + comments.avg.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "/5.0，共" + comments.total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "次点评")));
        }
        if (rshop.r == 1){
          row = row.append(div_restroom.clone());
        }
        row = row.append(div_row_fc.clone());

        $(".list").append(row);
      }

      if (page.i * page.n < page.t){
        $("#more").show();
      }

      $(".list-item").click(function(event){
        var shop = new Object();
        shop.i = $(this).attr("data-i");
        shop.lat = $(this).attr("data-lat");
        shop.lng = $(this).attr("data-lng");
        shop.d = $(this).attr("data-d") != null ? Number($(this).attr("data-d")) : 0;
        shop.c = $(this).attr("data-c");
        shop.n = $(this).attr("data-n");
        shop.r = $(this).attr("data-r");
        shop.a = $(this).attr("data-a");
        shop.s5 = $(this).attr("data-s5") != null ? Number($(this).attr("data-s5")) : 0;
        shop.s4 = $(this).attr("data-s4") != null ? Number($(this).attr("data-s4")) : 0;
        shop.s3 = $(this).attr("data-s3") != null ? Number($(this).attr("data-s3")) : 0;
        shop.s2 = $(this).attr("data-s2") != null ? Number($(this).attr("data-s2")) : 0;
        shop.s1 = $(this).attr("data-s1") != null ? Number($(this).attr("data-s1")) : 0;

        get_shop(shop);
      });
    }
  }

  function get_shops(openid, category_id, keyword, restroom){
    // get nearby shops
    var url = home + 'php/get_nearby_shops.php';
    var params = new Object();
    params.oi = openid;
    if (category_id != null && category_id > 0) params.ci = category_id;
    if (keyword != null && keyword.length > 0) params.k = keyword;
    if (restroom != null && restroom == 1) params.rt = restroom;
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
          var ss = null;
          if (page.i == 1) {// first page
            page.t = d.t;
            position.lat = d.lat;
            position.lng = d.lng;
            ss = store_ids(d.s);
          }
          else{
            ss = merge_shops_ids(d.s, hash);
          }
          display_shops(ss);
        }
    }, "json")
    .fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ", " + error;
      alert( "网络出现问题，请刷新页面。" );
    });
  }

  function merge_shop(rshop, shop){
    shop.ooi = rshop.ooi;
    shop.coi = rshop.coi;
    shop.e = rshop.e;
    shop.bh = rshop.bh;
    shop.sv = rshop.sv;
    shop.pd = rshop.pd;
    shop.ct = rshop.ct; // content
    shop.fp = rshop.fp;
    shop.fw = rshop.fw;
    shop.cd = rshop.cd;
    shop.wx = rshop.wx;
    shop.qq = rshop.qq;
    shop.phn = rshop.phn;
    shop.add = rshop.add;
    shop.vws = rshop.vws;
    return shop;
  }

  function display_shop(shop){
    $("#complaint-shop-id").val(shop.i);

    $("#comment-btn").show();

    if ($("#view-btn").is(":visible")){
      $("#view-btn").click();
    }

    $("#name").text(shop.n);
    $("#viewed").text(shop.vws == null ? "0" : shop.vws.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","));

    var comments = get_comment_avg_points(shop.s5, shop.s4, shop.s3, shop.s2, shop.s1);
    if (comments.total > 0){
      $("#stars").show();
      $("#average_points").text(comments.avg.toFixed(1));
      $("#comments").text(comments.total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    }
    else{
      $("#stars").hide();
      $("#average_points").text("");
      $("#comments").text("");
    }

    var openid = $("#openid").val();
    $("#refresh-btn").hide();
    $("#relocation-btn").hide();
    $("#close-btn").hide();
    $("#refresh-btn").unbind("click");
    $("#relocation-btn").unbind("click");
    $("#close-btn").unbind("click");
    if (openid == shop.ooi || openid == shop.coi) {
      // close shop
      $("#close-btn").show();
      $("#close-btn").click(function(event){
        if (confirm("是否删除此商家信息？")){
          $(this).attr("disabled", true);
          var url = home + 'php/edit_nearby_shop.php';
          var params = new Object();
          params.oi = $("#openid").val();
          params.i = Number($("#complaint-shop-id").val());
          params.t = 12;

          $.post(url, params, 
            function(d) {
              if (d.result != null && d.result == 0){
                alert(hashMap.Get(String(d.error)));
              }
              else {
                $("#close-btn").hide();
                $("#refresh-btn").hide();
                $("#relocation-btn").hide();
                $("#edit-btn").hide();

                $('#tab-list').click();
                tab_detail_disabled = true;
                $('#tab-detail').unbind("click");
              }
              $("#close-btn").removeAttr("disabled");
          }, "json")
          .fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            alert( "网络出现问题，请刷新页面。" );
            $("#close-btn").removeAttr("disabled");
          });
        }
      });

      // refresh shop
      var dtoday = new Date();
      dtoday.setHours(0,0,0,0);
      var time0 = dtoday.getTime();
      var dend = new Date(shop.e);
      dend.setHours(0,0,0,0);
      var time1 = dend.getTime();
      if (time1 >= time0 && (time1 - time0) <= 5 * 24 * 3600 * 1000){
        $("#refresh-btn").show();
        $("#refresh-btn").click(function(event){
          $(this).attr("disabled", true);
          var url = home + 'php/edit_nearby_shop.php';
          var params = new Object();
          params.oi = $("#openid").val();
          params.i = Number($("#complaint-shop-id").val());
          params.t = 11;

          $.post(url, params, 
            function(d) {
              if (d.result != null && d.result == 0){
                alert(hashMap.Get(String(d.error)));
              }
              else{
                $("#refresh-btn").hide();
              }
              $("#refresh-btn").removeAttr("disabled");
          }, "json")
          .fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            alert( "网络出现问题，请刷新页面。" );
            $("#refresh-btn").removeAttr("disabled");
          });
        });
      }

      // reset location - GPS lat, lng
      if (openid == shop.coi){
        $("#relocation-btn").show();
        $("#relocation-btn").click(function(event){
          if (confirm("﻿是否重新定位此商家地理位置？")){
            $(this).attr("disabled", true);
            var url = home + 'php/edit_nearby_shop.php';
            var params = new Object();
            params.oi = $("#openid").val();
            params.i = Number($("#complaint-shop-id").val());
            params.t = 9;

            $.post(url, params, 
              function(d) {
                if (d.result != null && d.result == 0){
                  alert(hashMap.Get(String(d.error)));
                }
                $("#relocation-btn").removeAttr("disabled");
            }, "json")
            .fail(function( jqxhr, textStatus, error ) {
              var err = textStatus + ", " + error;
              alert( "网络出现问题，请刷新页面。" );
              $("#relocation-btn").removeAttr("disabled");
            });
          }
        });
      }
    }

    // category
    $("#category").text(map_categories.Get(String(shop.c)));

    var attributes = get_attributes(shop.a);
    if (attributes != null){
      $("#att-tag-block").show();
      $("#att-tag").html(attributes);
    }
    else{
      $("#att-tag-block").hide();
      $("#att-tag").html("");
    }

    if (shop.bh != null && shop.bh.length > 0){
      $("#business-hours-block").show();
      $("#business-hours").html(shop.bh);
    }
    else{
      $("#business-hours-block").hide();
      $("#business-hours").html("");
    }

    if (shop.sv != null && shop.sv.length > 0){
      $("#services-block").show();
      $("#services").html(shop.sv);
    }
    else{
      $("#services-block").hide();
      $("#services").html("");
    }

    if (shop.pd != null && shop.pd.length > 0){
      $("#products-block").show();
      $("#products").html(shop.pd);
    }
    else{
      $("#products-block").hide();
      $("#products").html("");
    }

    if (shop.ct != null && shop.ct.length > 0){
      $("#content-block").show();
      $("#content").html(shop.ct);
    }
    else{
      $("#content-block").hide();
      $("#content").html("");
    }

    var tags = get_tags(shop.fp, shop.fw, shop.cd, shop.r);
    if (tags != null){
      $("#tag-block").show();
      $("#tag").html(tags);
    }
    else{
      $("#tag-block").hide();
      $("#tag").html("");
    }

    if (shop.wx != null && shop.wx.length > 0){
      $("#weixin-div").show().html("微信：<span>" + shop.wx + "</span>");
    }
    else{
      $("#weixin-div").hide().html("");
    }

    if (shop.qq != null && shop.qq.length > 0){
      $("#qq-div").show().html("QQ ：<span>" + shop.qq + "</span>");
    }
    else{
      $("#qq-div").hide().html("");
    }

    if (shop.phn != null && shop.phn.length > 0){
      var tag_a = '<a href="tel:phone">phone [<span class="call">拨打</span>]</a><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
      var phones = shop.phn.split(",");
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

    if (shop.add != null && shop.add.length > 0){
      $("#address-div").show().html("地址：<span>" + shop.add + "</span>");
    }
    else{
      $("#address-div").hide().html("");
    }
    
    var target = new Object();
    target.lng = shop.lng;
    target.lat = shop.lat;
    target.add = shop.add;
    map_click(target);

    display_edit_win(shop);
  }

  function get_shop(shop){
    // get nearby shop
    var url = home + 'php/get_nearby_shop.php';
    var params = new Object();
    params.i = shop.i;

    $.post(url, params, 
      function(d) {
        if (d.result != null && d.result == 0){
          alert(hashMap.Get(String(d.error)));
        }
        else {
          var ss = merge_shop(d, shop);
          display_shop(ss);
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
      var id = $("#complaint-shop-id").val();

      var url = home + 'php/complaint_shop.php';
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
    var keyword = $('#keyword_s').val();
    if (keyword != null && keyword.length == 0) keyword = null;
    var restroom = Number($('#restroom_s').val());
    if (restroom != 1) restroom = null;
    get_shops(openid, category_id, keyword, restroom);
  });

  function get_attributes(attributes){
    if (attributes == null) return null;
    var atts = attributes.split(",");
    var attr = "";
    for (var i = 0; i < atts.length; i++){
      attr = attr + " " + map_categories.Get(atts[i]);
    }
    if (attr.length > 0){
      attr = attr.substr(1);
    }
    else{
      attr = null;
    }
    return attr;
  }

  function get_comment_avg_points(s5, s4, s3, s2, s1){
    var obj = new Object();
    obj.total = s5 + s4 + s3 + s2 + s1;
    obj.avg = Math.round((5.0 * s5 + 4.0 * s4 + 3.0 * s3 + 2.0 * s2 + s1) * 10 / obj.total) / 10;
    return obj;
  }

  function get_tags(free_parking, free_wifi, cards, restroom){
    var tags = "";
    if (free_parking == 1){
      tags += " 免费停车";
    }
    if (free_wifi == 1){
      tags += " 无线上网";
    }
    if (cards == 1){
      tags += " 可以刷卡";
    }
    if (restroom == 1){
      tags += " 公共洗手间";
    }
    if (tags.length > 0){
      tags = tags.substr(1);
    }
    else{
      tags = null;
    }
    return tags;
  }

  function init_edit_win(){
    // comment click
    $("#comment-btn").click(function(event){
      $(this).hide();
      $("#save-comment-btn").show();
      $("#cancel-comment-btn").show();
      $("#edit-comment").show();
    });
    $("#cancel-comment-btn").click(function(event){
      $("#comment-btn").show();
      $(this).hide();
      $("#save-comment-btn").hide();
      $("#edit-comment").hide();
    });
    $("#save-comment-btn").click(function(event){
      var stars = Number($(".comment:checked").val());
      if (stars >= 1 && stars <= 5){
        var url = home + 'php/edit_nearby_shop.php';
        var params = new Object();
        params.oi = $("#openid").val();
        params.i = Number($("#complaint-shop-id").val());
        params.t = 8;
        params.st = stars;

        $.post(url, params, 
          function(d) {
            if (d.result != null && d.result == 0){
              alert(hashMap.Get(String(d.error)));
            }
            else {
              $("#save-comment-btn").hide();
              $("#cancel-comment-btn").hide();
              $("#edit-comment").hide();
            }
        }, "json")
        .fail(function( jqxhr, textStatus, error ) {
          var err = textStatus + ", " + error;
          alert( "网络出现问题，请刷新页面。" );
        });
      }
    });

    // edit-win/view-win click
    $("#edit-btn").click(function(event){
      $(this).hide();
      $("#view-btn").show();
      $("#view-win").hide();
      $("#edit-win").show();
    });
    $("#view-btn").click(function(event){
      $(this).hide();
      $("#edit-btn").show();
      $("#view-win").show();
      $("#edit-win").hide();
    });

    // show categories of shop
    var map = get_categories_by_parent_id(shop_categories, null);
    var option = $("<option />");
    $('#edit-cat_level_1').append(option.clone().attr("value", "0").append("请选择"));
    for (var i = 0; i < map.length; i++){
      var row = option.clone().attr("value", map[i].i.toString()).append(map[i].n);
      $('#edit-cat_level_1').append(row);
    }

    $('#edit-cat_level_1').click(function(event){
      $('#edit-cat_level_1').parent().find(".myerror").remove();
      $('#edit-cat_level_2_div').hide();
      $('#edit-cat_level_2').html("");
      $('#edit-cat_level_3_div').hide();
      $('#edit-cat_level_3').html("");
      var parent_id = Number($('#edit-cat_level_1 option:selected').val());
      if (parent_id > 0){
        var map = get_categories_by_parent_id(shop_categories, parent_id);
        if (map.length > 0){
          $('#edit-cat_level_2_div').show();
          var option = $("<option />");
          $('#edit-cat_level_2').append(option.clone().attr("value", "0").append("请选择"));
          for (var i = 0; i < map.length; i++){
            var row = option.clone().attr("value", map[i].i.toString()).append(map[i].n);
            $('#edit-cat_level_2').append(row);
          }
        }
      }
      show_attributes(parent_id);
    });
    $('#edit-cat_level_2').click(function(event){
      $('#edit-cat_level_1').parent().find(".myerror").remove();
      $('#edit-cat_level_3_div').hide();
      $('#edit-cat_level_3').html("");
      var parent_id = Number($('#edit-cat_level_2 option:selected').val());
      if (parent_id > 0){
        var map = get_categories_by_parent_id(shop_categories, parent_id);
        if (map.length > 0){
          $('#edit-cat_level_3_div').show();
          var option = $("<option />");
          $('#edit-cat_level_3').append(option.clone().attr("value", "0").append("请选择"));
          for (var i = 0; i < map.length; i++){
            var row = option.clone().attr("value", map[i].i.toString()).append(map[i].n);
            $('#edit-cat_level_3').append(row);
          }
        }
      }
      show_attributes(parent_id);
    });
    $('#edit-cat_level_3').click(function(event){
      $('#edit-cat_level_1').parent().find(".myerror").remove();
      var parent_id = Number($('#edit-cat_level_3 option:selected').val());
      show_attributes(parent_id);
    });

    // save/cancel categories & attribute
    $("#save-attributes-btn").click(function(event){
      $(this).attr("disabled", true);
      $('#edit-att_tag_div').find(".myerror").remove();
      // retrive data
      // send to edit_nearby_shop.php
      // update data-c, data-a
      // display the new values
      var coi = $("#edit-att_tag_div").attr("data-coi");
      var c = Number($("#edit-att_tag_div").attr("data-c"));
      var a = $("#edit-att_tag_div").attr("data-a");
      var openid = $("#openid").val();

      var div = $('<div/>').addClass('myerror').css("color", "red");
      var valid = true;
      var att_ids = null;
      if ($("#edit-att_tag_div").is(":visible")){
        att_ids = "";
        var count = 0;
        $("#edit-att_tag_div input:checked").each(function(){
          att_ids += "," + $(this).val();
          count++;
        });
        if (count > 10){
          valid = false;
          $('#edit-att_tag_div').append(div.clone().append("最多请选择10项类别标签"));;
        }
        if (att_ids.length > 0){
          att_ids = att_ids.substr(1, att_ids.length - 1);
        }
        else
          att_ids = null;
      }
      // only certified owner can change categories, otherwise, attributes can be changed
      if (valid){
        if (openid != null && openid.length > 0 && openid == coi){
          var cat_id = $("#edit-cat_level_3_div").is(":visible") ? Number($('#edit-cat_level_3 option:selected').val()) : ($("#edit-cat_level_2_div").is(":visible") ? Number($('#edit-cat_level_2 option:selected').val()) : Number($('#edit-cat_level_1 option:selected').val()));
          if (!(cat_id > 0)){
            valid = false;
            $('#edit-att_tag_div').parent().append(div.clone().append("请选择商家所属类别"));
          }
          if (valid){
            if (cat_id != c){
              var url = home + 'php/edit_nearby_shop.php';
              var params = new Object();
              params.oi = $("#openid").val();
              params.i = Number($("#complaint-shop-id").val());
              params.t = 10;
              params.ci = cat_id;
              params.aid = att_ids;

              $.post(url, params, 
                function(d) {
                  if (d.result != null && d.result == 0){
                    alert(hashMap.Get(String(d.error)));
                  }
                  else {
                    hideSaveMessage();
                    $("#edit-att_tag_div").attr("data-c", String(cat_id));
                    $("#edit-att_tag_div").attr("data-a", att_ids);
                    $("#category").text(map_categories.Get(String(cat_id)));
                    var attributes = get_attributes(att_ids);
                    if (attributes != null){
                      $("#att-tag-block").show();
                      $("#att-tag").html(attributes);
                    }
                    else{
                      $("#att-tag-block").hide();
                      $("#att-tag").html("");
                    }
                  }
                  $("#save-attributes-btn").removeAttr("disabled");
              }, "json")
              .fail(function( jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
                alert( "网络出现问题，请刷新页面。" );
                $("#save-attributes-btn").removeAttr("disabled");
              });
            }
            else if (att_ids != null && att_ids != a){
              var url = home + 'php/edit_nearby_shop.php';
              var params = new Object();
              params.oi = $("#openid").val();
              params.i = Number($("#complaint-shop-id").val());
              params.t = 7;
              params.aid = att_ids;

              $.post(url, params, 
                function(d) {
                  if (d.result != null && d.result == 0){
                    alert(hashMap.Get(String(d.error)));
                  }
                  else {
                    hideSaveMessage();
                    $("#edit-att_tag_div").attr("data-a", att_ids);
                    var attributes = get_attributes(att_ids);
                    if (attributes != null){
                      $("#att-tag-block").show();
                      $("#att-tag").html(attributes);
                    }
                    else{
                      $("#att-tag-block").hide();
                      $("#att-tag").html("");
                    }
                  }
                  $("#save-attributes-btn").removeAttr("disabled");
              }, "json")
              .fail(function( jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
                alert( "网络出现问题，请刷新页面。" );
                $("#save-attributes-btn").removeAttr("disabled");
              });
            }
            else if (att_ids == null){
              $('#edit-att_tag_div').parent().append(div.clone().append("请选择商家类别标签"));
              $(this).removeAttr("disabled");
            }
            else{
              $(this).removeAttr("disabled");
            }
          }
          else{
            $(this).removeAttr("disabled");
          }
        }
        else{ // not certified owner
          if (att_ids != null && att_ids != a){
            var url = home + 'php/edit_nearby_shop.php';
            var params = new Object();
            params.oi = $("#openid").val();
            params.i = Number($("#complaint-shop-id").val());
            params.t = 7;
            params.aid = att_ids;

            $.post(url, params, 
              function(d) {
                if (d.result != null && d.result == 0){
                  alert(hashMap.Get(String(d.error)));
                }
                else {
                  hideSaveMessage();
                  $("#edit-att_tag_div").attr("data-a", att_ids);
                  var attributes = get_attributes(att_ids);
                  if (attributes != null){
                    $("#att-tag-block").show();
                    $("#att-tag").html(attributes);
                  }
                  else{
                    $("#att-tag-block").hide();
                    $("#att-tag").html("");
                  }
                }
                $("#save-attributes-btn").removeAttr("disabled");
            }, "json")
            .fail(function( jqxhr, textStatus, error ) {
              var err = textStatus + ", " + error;
              alert( "网络出现问题，请刷新页面。" );
              $("#save-attributes-btn").removeAttr("disabled");
            });
          }
          else if (att_ids == null){
            $('#edit-att_tag_div').parent().append(div.clone().append("请选择商家类别标签"));
            $(this).removeAttr("disabled");
          }
          else{
            $(this).removeAttr("disabled");
          }
        }
      }
      else{
        $(this).removeAttr("disabled");
      }
    });
    $("#cancel-attributes-btn").click(function(event){
      // restore the original values and display
      $('#edit-att_tag_div').find(".myerror").remove();
      display_edit_attributes();
    });

    // save/cancel business hours
    $("#save-business-hours-btn").click(function(event){
      $(this).attr("disabled", true);
      $('#edit-business-hours').parent().find(".myerror").remove();
      var bh0 = get_string($("#edit-business-hours").attr("data-bh"));
      var bh1 = get_string($("#edit-business-hours").val());
      if (bh1 != null && bh1 != bh0){
        var url = home + 'php/edit_nearby_shop.php';
        var params = new Object();
        params.oi = $("#openid").val();
        params.i = Number($("#complaint-shop-id").val());
        params.t = 1;
        params.bh = bh1;

        $.post(url, params, 
          function(d) {
            if (d.result != null && d.result == 0){
              alert(hashMap.Get(String(d.error)));
            }
            else {
              hideSaveMessage();
              $("#edit-business-hours").attr("data-bh", bh1);
              $("#business-hours-block").show();
              $("#business-hours").html(bh1);
            }
            $("#save-business-hours-btn").removeAttr("disabled");
        }, "json")
        .fail(function( jqxhr, textStatus, error ) {
          var err = textStatus + ", " + error;
          alert( "网络出现问题，请刷新页面。" );
          $("#save-business-hours-btn").removeAttr("disabled");
        });
      }
      else if (bh1 == null){
        $('#edit-business-hours').parent().append($('<div/>').addClass('myerror').css("color", "red").append("请填写商家营业时间"));
        $(this).removeAttr("disabled");
      }
      else{
        $(this).removeAttr("disabled");
      }
    });
    $("#cancel-business-hours-btn").click(function(event){
      $('#edit-business-hours').parent().find(".myerror").remove();
      display_edit_business_hours();
    });

    // save/cancel services
    $("#save-services-btn").click(function(event){
      $(this).attr("disabled", true);
      $('#edit-services').parent().find(".myerror").remove();
      var sv0 = get_string($("#edit-services").attr("data-sv"));
      var sv1 = get_string($("#edit-services").val());
      if (sv1 != null && sv1 != sv0){
        var url = home + 'php/edit_nearby_shop.php';
        var params = new Object();
        params.oi = $("#openid").val();
        params.i = Number($("#complaint-shop-id").val());
        params.t = 2;
        params.sv = sv1;

        $.post(url, params, 
          function(d) {
            if (d.result != null && d.result == 0){
              alert(hashMap.Get(String(d.error)));
            }
            else {
              hideSaveMessage();
              $("#edit-services").attr("data-sv", sv1);
              $("#services-block").show();
              $("#services").html(sv1);
            }
            $("#save-services-btn").removeAttr("disabled");
        }, "json")
        .fail(function( jqxhr, textStatus, error ) {
          var err = textStatus + ", " + error;
          alert( "网络出现问题，请刷新页面。" );
          $("#save-services-btn").removeAttr("disabled");
        });
      }
      else if (sv1 == null){
        $('#edit-services').parent().append($('<div/>').addClass('myerror').css("color", "red").append("请填写商家服务描述"));
        $(this).removeAttr("disabled");
      }
      else{
        $(this).removeAttr("disabled");
      }
    });
    $("#cancel-services-btn").click(function(event){
      $('#edit-services').parent().find(".myerror").remove();
      display_edit_services();
    });

    // save/cancel products
    $("#save-products-btn").click(function(event){
      $(this).attr("disabled", true);
      $('#edit-products').parent().find(".myerror").remove();
      var pd0 = get_string($("#edit-products").attr("data-pd"));
      var pd1 = get_string($("#edit-products").val());
      if (pd1 != null && pd1 != pd0){
        var url = home + 'php/edit_nearby_shop.php';
        var params = new Object();
        params.oi = $("#openid").val();
        params.i = Number($("#complaint-shop-id").val());
        params.t = 3;
        params.pd = pd1;

        $.post(url, params, 
          function(d) {
            if (d.result != null && d.result == 0){
              alert(hashMap.Get(String(d.error)));
            }
            else {
              hideSaveMessage();
              $("#edit-products").attr("data-pd", pd1);
              $("#products-block").show();
              $("#products").html(pd1);
            }
            $("#save-products-btn").removeAttr("disabled");
        }, "json")
        .fail(function( jqxhr, textStatus, error ) {
          var err = textStatus + ", " + error;
          alert( "网络出现问题，请刷新页面。" );
          $("#save-products-btn").removeAttr("disabled");
        });
      }
      else if (pd1 == null){
        $('#edit-products').parent().append($('<div/>').addClass('myerror').css("color", "red").append("请填写商家商品描述"));
        $(this).removeAttr("disabled");
      }
      else{
        $(this).removeAttr("disabled");
      }
    });
    $("#cancel-products-btn").click(function(event){
      $('#edit-products').parent().find(".myerror").remove();
      display_edit_products();
    });

    // save/cancel content
    $("#save-content-btn").click(function(event){
      $(this).attr("disabled", true);
      $('#edit-content').parent().find(".myerror").remove();
      var ct0 = get_string($("#edit-content").attr("data-ct"));
      var ct1 = get_string($("#edit-content").val());
      if (ct1 != null && ct1 != ct0){
        var url = home + 'php/edit_nearby_shop.php';
        var params = new Object();
        params.oi = $("#openid").val();
        params.i = Number($("#complaint-shop-id").val());
        params.t = 4;
        params.ct = ct1;

        $.post(url, params, 
          function(d) {
            if (d.result != null && d.result == 0){
              alert(hashMap.Get(String(d.error)));
            }
            else {
              hideSaveMessage();
              $("#edit-content").attr("data-ct", ct1);
              $("#content-block").show();
              $("#content").html(ct1);
            }
            $("#save-content-btn").removeAttr("disabled");
        }, "json")
        .fail(function( jqxhr, textStatus, error ) {
          var err = textStatus + ", " + error;
          alert( "网络出现问题，请刷新页面。" );
          $("#save-content-btn").removeAttr("disabled");
        });
      }
      else if (ct1 == null){
        $('#edit-content').parent().append($('<div/>').addClass('myerror').css("color", "red").append("请填写商家简介"));
        $(this).removeAttr("disabled");
      }
      else{
        $(this).removeAttr("disabled");
      }
    });
    $("#cancel-content-btn").click(function(event){
      $('#edit-content').parent().find(".myerror").remove();
      display_edit_content();
    });

    // save/cancel tags
    $("#save-tag-btn").click(function(event){
      $(this).attr("disabled", true);
      var fp0 = Number($("#edit-free_parking").attr("data-fp")) == 1 ? 1 : null;
      var fw0 = Number($("#edit-free_wifi").attr("data-fw")) == 1 ? 1 : null;
      var cd0 = Number($("#edit-cards").attr("data-cd")) == 1 ? 1 : null;
      var rt0 = Number($("#edit-restroom").attr("data-r")) == 1 ? 1 : null;
      var fp1 = $("#edit-free_parking:checked").val() != null ? 1 : null;
      var fw1 = $("#edit-free_wifi:checked").val() != null ? 1 : null;
      var cd1 = $("#edit-cards:checked").val() != null ? 1 : null;
      var rt1 = $("#edit-restroom:checked").val() != null ? 1 : null;
      if (fp1 != fp0 || fw1 != fw0 || cd1 != cd0 || rt1 != rt0){
        var url = home + 'php/edit_nearby_shop.php';
        var params = new Object();
        params.oi = $("#openid").val();
        params.i = Number($("#complaint-shop-id").val());
        params.t = 5;
        params.rt = rt1;
        params.fp = fp1;
        params.fw = fw1;
        params.cd = cd1;

        $.post(url, params, 
          function(d) {
            if (d.result != null && d.result == 0){
              alert(hashMap.Get(String(d.error)));
            }
            else {
              hideSaveMessage();
              $("#edit-free_parking").attr("data-fp", fp1 == 1 ? "1" : "0");
              $("#edit-free_wifi").attr("data-fw", fw1 == 1 ? "1" : "0");
              $("#edit-cards").attr("data-cd", cd1 == 1 ? "1" : "0");
              $("#edit-restroom").attr("data-r", rt1 == 1 ? "1" : "0");
              var tags = get_tags(fp1, fw1, cd1, rt1);
              if (tags != null){
                $("#tag-block").show();
                $("#tag").html(tags);
              }
              else{
                $("#tag-block").hide();
                $("#tag").html("");
              }
            }
            $("#save-tag-btn").removeAttr("disabled");
        }, "json")
        .fail(function( jqxhr, textStatus, error ) {
          var err = textStatus + ", " + error;
          alert( "网络出现问题，请刷新页面。" );
          $("#save-tag-btn").removeAttr("disabled");
        });
      }
      else{
        $(this).removeAttr("disabled");
      }
    });
    $("#cancel-tag-btn").click(function(event){
      display_edit_tags();
    });

    // save/cancel contacts
    $("#save-contact-btn").click(function(event){
      $(this).attr("disabled", true);
      $('#edit-address').parent().find(".myerror").remove();
      var wx0 = get_string($("#edit-weixin").attr("data-wx"));
      var qq0 = get_string($("#edit-qq").attr("data-qq"));
      var phn0 = get_string($("#edit-phone").attr("data-phn"));
      var add0 = get_string($("#edit-address").attr("data-add"));
      var wx1 = get_string($("#edit-weixin").val());
      var qq1 = get_string($("#edit-qq").val());
      var phn1 = get_string($("#edit-phone").val());
      var add1 = get_string($("#edit-address").val());
      if ((wx1 != null && wx1 != wx0) || (qq1 != null && qq1 != qq0) || (phn1 != null && phn1 != phn0) || (add1 != null && add1 != add0)){
        var url = home + 'php/edit_nearby_shop.php';
        var params = new Object();
        params.oi = $("#openid").val();
        params.i = Number($("#complaint-shop-id").val());
        params.t = 6;
        params.wx = wx1;
        params.qq = qq1;
        params.phn = phn1;
        params.add = add1;

        $.post(url, params, 
          function(d) {
            if (d.result != null && d.result == 0){
              alert(hashMap.Get(String(d.error)));
            }
            else {
              hideSaveMessage();
              $("#edit-weixin").attr("data-wx", wx1 != null ? wx1 : "");
              $("#edit-qq").attr("data-qq", qq1 != null ? qq1 : "");
              $("#edit-phone").attr("data-phn", phn1 != null ? phn1 : "");
              $("#edit-address").attr("data-add", add1 != null ? add1 : "");

              if (wx1 != null && wx1.length > 0){
                $("#weixin-div").show().html("微信：<span>" + wx1 + "</span>");
              }
              else{
                $("#weixin-div").hide().html("");
              }

              if (qq1 != null && qq1.length > 0){
                $("#qq-div").show().html("QQ ：<span>" + qq1 + "</span>");
              }
              else{
                $("#qq-div").hide().html("");
              }

              if (phn1 != null && phn1.length > 0){
                var tag_a = '<a href="tel:phone">phone [<span class="call">拨打</span>]</a><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                var phones = phn1.split(",");
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

              if (add1 != null && add1.length > 0){
                $("#address-div").show().html("地址：<span>" + add1 + "</span>");
              }
              else{
                $("#address-div").hide().html("");
              }

            }
            $("#save-contact-btn").removeAttr("disabled");
        }, "json")
        .fail(function( jqxhr, textStatus, error ) {
          var err = textStatus + ", " + error;
          alert( "网络出现问题，请刷新页面。" );
          $("#save-contact-btn").removeAttr("disabled");
        });
      }
      else if (wx1 == null && qq1 == null && phn1 == null && add1 == null) {
        $('#edit-address').parent().append($('<div/>').addClass('myerror').css("color", "red").append("请填写至少一种联系方式"));
        $(this).removeAttr("disabled");
      }
      else{
        $(this).removeAttr("disabled");
      }
    });
    $("#cancel-contact-btn").click(function(event){
      $('#edit-address').parent().find(".myerror").remove();
      display_edit_contacts();
    });
  }

  function display_edit_win(shop){
    // categories & attributes
    $("#edit-att_tag_div").attr("data-ooi", shop.ooi == null ? "" : shop.ooi).attr("data-coi", shop.coi == null ? "" : shop.coi).attr("data-c", shop.c == null ? "0" : shop.c).attr("data-a", shop.a == null ? "" : shop.a);
    display_edit_attributes();
    // business hours
    $("#edit-business-hours").attr("data-bh", shop.bh == null ? "" : shop.bh);
    display_edit_business_hours();
    // services
    $("#edit-services").attr("data-sv", shop.sv == null ? "" : shop.sv);
    display_edit_services();
    // products
    $("#edit-products").attr("data-pd", shop.pd == null ? "" : shop.pd);
    display_edit_products();
    // content
    $("#edit-content").attr("data-ct", shop.ct == null ? "" : shop.ct);
    display_edit_content();
    // tags
    $("#edit-free_parking").attr("data-fp", shop.fp == 1 ? "1" : "0");
    $("#edit-free_wifi").attr("data-fw", shop.fw == 1 ? "1" : "0");
    $("#edit-cards").attr("data-cd", shop.cd == 1 ? "1" : "0");
    $("#edit-restroom").attr("data-r", shop.r == 1 ? "1" : "0");
    display_edit_tags();
    // contacts
    $("#edit-weixin").attr("data-wx", shop.wx == null ? "" : shop.wx);
    $("#edit-qq").attr("data-qq", shop.qq == null ? "" : shop.qq);
    $("#edit-phone").attr("data-phn", shop.phn == null ? "" : shop.phn);
    $("#edit-address").attr("data-add", shop.add == null ? "" : shop.add);
    display_edit_contacts();
  }

  function display_edit_attributes(){
    var ooi = $("#edit-att_tag_div").attr("data-ooi");
    var coi = $("#edit-att_tag_div").attr("data-coi");
    var c = Number($("#edit-att_tag_div").attr("data-c"));
    var a = $("#edit-att_tag_div").attr("data-a");

    var openid = $("#openid").val();
    $("#edit-cat_level_1_div").hide();
    $("#edit-cat_level_2_div").hide();
    $('#edit-cat_level_2').html("");
    $("#edit-cat_level_3_div").hide();
    $('#edit-cat_level_3').html("");

    // only certified owner can change categories, otherwise, attributes can be changed
    if (openid != null && openid.length > 0 && openid == coi){
      var grandparent = Math.floor(c / 10000.0) * 10000;
      var parent = Math.floor(c / 100.0) * 100;
      $("#edit-cat_level_1_div").show();
      $("#edit-cat_level_1").val(String(grandparent));
      var map = get_categories_by_parent_id(shop_categories, grandparent);
      if (map.length > 0){
        $('#edit-cat_level_2_div').show();
        var option = $("<option />");
        $('#edit-cat_level_2').append(option.clone().attr("value", "0").append("请选择"));
        for (var i = 0; i < map.length; i++){
          var row = option.clone().attr("value", map[i].i.toString()).append(map[i].n);
          $('#edit-cat_level_2').append(row);
        }
        $("#edit-cat_level_2").val(String(parent));

        map = get_categories_by_parent_id(shop_categories, parent);
        if (map.length > 0){
          $('#edit-cat_level_3_div').show();
          var option = $("<option />");
          $('#edit-cat_level_3').append(option.clone().attr("value", "0").append("请选择"));
          for (var i = 0; i < map.length; i++){
            var row = option.clone().attr("value", map[i].i.toString()).append(map[i].n);
            $('#edit-cat_level_3').append(row);
          }
          $("#edit-cat_level_3").val(String(c));
        }
      }
    }
    show_attributes(c, a);
  }
  function display_edit_business_hours(){
    $("#edit-business-hours").val($("#edit-business-hours").attr("data-bh"));
  }
  function display_edit_services(){
    $("#edit-services").val($("#edit-services").attr("data-sv"));
  }
  function display_edit_products(){
    $("#edit-products").val($("#edit-products").attr("data-pd"));
  }
  function display_edit_content(){
    $("#edit-content").val($("#edit-content").attr("data-ct"));
  }
  function display_edit_tags(){
    if (Number($("#edit-free_parking").attr("data-fp")) == 1){
      $("#edit-free_parking").removeAttr("checked");
      $("#edit-free_parking").click();
    }
    else{
      $("#edit-free_parking").removeAttr("checked");
    }
    if (Number($("#edit-free_wifi").attr("data-fw")) == 1){
      $("#edit-free_wifi").removeAttr("checked");
      $("#edit-free_wifi").click();
    }
    else{
      $("#edit-free_wifi").removeAttr("checked");
    }
    if (Number($("#edit-cards").attr("data-cd")) == 1){
      $("#edit-cards").removeAttr("checked");
      $("#edit-cards").click();
    }
    else{
      $("#edit-cards").removeAttr("checked");
    }
    if (Number($("#edit-restroom").attr("data-r")) == 1){
      $("#edit-restroom").removeAttr("checked");
      $("#edit-restroom").click();
    }
    else{
      $("#edit-restroom").removeAttr("checked");
    }
  }
  function display_edit_contacts(){
    $("#edit-weixin").val($("#edit-weixin").attr("data-wx"));
    $("#edit-qq").val($("#edit-qq").attr("data-qq"));
    $("#edit-phone").val($("#edit-phone").attr("data-phn"));
    $("#edit-address").val($("#edit-address").attr("data-add"));
  }

  function show_attributes(parent_id, attributes){
    var attributes = attributes == null ? new Array() : attributes.split(",");

    $('#edit-att_tag_div').find(".myerror").remove();
    $('#edit-att_tag_div').hide();
    $('#edit-att_tag_div').html("");
    if (parent_id > 0){
      var atts = get_attributes_by_category_id(shop_categories, parent_id);
      if (atts.length > 0){
        $('#edit-att_tag_div').show();
        var div = $('<div />');
        var label = $('<label />');
        var input = $('<input />').attr("type","checkbox");
        for (var i = 0; i < atts.length; i++){
          var att = atts[i];
          var row;
          if (att.a == null){
            var index = -1;
            for (var k = 0; k < attributes.length; k++){
              if (att.i == Number(attributes[k])){
                index = k;
                break;
              }
            }
            if (index >= 0){
              attributes.splice(index, 1);
              row = div.clone().append(label.clone().attr("for","aid_"+att.i.toString()).append(att.n)).append(input.clone().attr("id","aid_"+att.i.toString()).attr("value",att.i.toString()).attr("checked", "checked"));
            }
            else{
              row = div.clone().append(label.clone().attr("for","aid_"+att.i.toString()).append(att.n)).append(input.clone().attr("id","aid_"+att.i.toString()).attr("value",att.i.toString()));
            }
          }
          else{
            row = div.clone().append(label.clone().append(att.n + "："));
            var label2 = label.clone().addClass("mgr10");
            var sub_atts = att.a;
            for (var j = 0; j < sub_atts.length; j++){
              var sub_att = sub_atts[j];
              var index = -1;
              for (var k = 0; k < attributes.length; k++){
                if (sub_att.i == Number(attributes[k])){
                  index = k;
                  break;
                }
              }
              if (index >= 0){
                attributes.splice(index, 1);
                row = row.append(input.clone().attr("id","aid_"+sub_att.i.toString()).attr("value",sub_att.i.toString()).attr("checked", "checked")).append(label2.clone().attr("for","aid_"+sub_att.i.toString()).append(sub_att.n));
              }
              else{
                row = row.append(input.clone().attr("id","aid_"+sub_att.i.toString()).attr("value",sub_att.i.toString())).append(label2.clone().attr("for","aid_"+sub_att.i.toString()).append(sub_att.n));
              }
            }
          }
          $('#edit-att_tag_div').append(row);
        }
      }
      $("#edit-att_tag_div input").click(function(event){
        $('#edit-att_tag_div').find(".myerror").remove();
        var count = 0;
        $("#edit-att_tag_div input:checked").each(function(){
          count++;
        });
        if (count > 10){
          valid = false;
          $('#edit-att_tag_div').append($('<div/>').addClass('myerror').css("color", "red").append("最多请选择10项类别标签"));;
        }
      });
    }
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

  function hideSaveMessage(){
    $("#save-message").show(function(){
      setTimeout(function(){$("#save-message").hide(1000);}, 1000);
    });
  }

});