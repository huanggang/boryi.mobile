// http://m.boryi.com/post-nearby-shops.htm#oi=9032g19pvbh19g
$(document).ready(function(){

  var baseurl = document.URL;
  var home = baseurl.substring(0, baseurl.lastIndexOf('/')) + "/";
  init();

  function init() {
    var dtoday = new Date();
    dtoday.setHours(0,0,0,0);
    dtoday.setMonth(dtoday.getMonth()+1);
    $("#end").text(dtoday.getFullYear() + "/" + (dtoday.getMonth()+1) + "/" + dtoday.getDate());

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

    // check if the user can post a shop
    var url = home + 'php/post_checking.php?oi=' + $("#openid").val() + "&t=3";
    $.getJSON(url, 
      function(d) {
        if (d.result == 0){
          alert(hashMap.Get(String(d.error)));
        }
      })
    .fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ", " + error;
      //alert( "网络出现问题，请刷新页面。");
    });

    // show categories of shop
    var map = get_categories_by_parent_id(shop_categories, null);
    var option = $("<option />");
    $('#cat_level_1').append(option.clone().attr("value", "0").append("请选择"));
    for (var i = 0; i < map.length; i++){
      var row = option.clone().attr("value", map[i].i.toString()).append(map[i].n);
      $('#cat_level_1').append(row);
    }
  }

  $('#cat_level_1').change(function(event){
    $('#cat_level_1').parent().find(".myerror").remove();
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
    show_attributes(parent_id);
  });
  $('#cat_level_2').change(function(event){
    $('#cat_level_1').parent().find(".myerror").remove();
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
    show_attributes(parent_id);
  });
  $('#cat_level_3').change(function(event){
    $('#cat_level_1').parent().find(".myerror").remove();
    var parent_id = Number($('#cat_level_3 option:selected').val());
    show_attributes(parent_id);
  });

  // the form validator
  var validator = $("#setForm").validate({
    errorPlacement: function(error, element) {
      element.parent().append(error); // default function
    }, 
    rules: { 
      shop: { 
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
      address: {
        rangelength: [4,256],
      },
    }, 
    messages: { 
      shop: { 
        required: "请填写商家名",
        rangelength: "商家名至少两个字最长64个字", 
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

  $('#setForm').submit(function(event){
    event.preventDefault();
  });

  $('#postShop').click(function(event){
    $(this).attr("disabled", true);
    var valid = true;
    var div = $('<div/>').addClass('myerror').css("color", "red");
    
    // check shops category
    $('#cat_level_1').parent().find(".myerror").remove();
    var cat_id = $("#cat_level_3_div").is(":visible") ? Number($('#cat_level_3 option:selected').val()) : ($("#cat_level_2_div").is(":visible") ? Number($('#cat_level_2 option:selected').val()) : Number($('#cat_level_1 option:selected').val()));
    if (!(cat_id > 0)){
      valid = false;
      $('#cat_level_1').parent().append(div.clone().append("请选择商家所属类别"));
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

    var att_ids = null;
    $('#att_tag_div').find(".myerror").remove();
    if ($("#att_tag_div").is(":visible")){
      att_ids = "";
      var count = 0;
      $("#att_tag_div input:checked").each(function(){
        att_ids += "," + $(this).val();
        count++;
      });
      if (count > 10){
        valid = false;
        $('#att_tag_div').append(div.clone().append("最多请选择10项类别标签"));;
      }
      if (att_ids.length > 0){
        att_ids = att_ids.substr(1, att_ids.length - 1);
      }
      else
        att_ids = null;
    }

    var business_hours = get_string($("#business_hours").val());
    var services = get_string($("#services").val());
    var products = get_string($("#products").val());
    var content = get_string($("#content").val());

    var restroom = $("#restroom:checked").val() != null ? 1 : null;
    var free_parking = $("#free_parking:checked").val() != null ? 1 : null;
    var free_wifi = $("#free_wifi:checked").val() != null ? 1 : null;
    var cards = $("#cards:checked").val() != null ? 1 : null;

    if(validator.form() && valid){
      var openid = get_string($("#openid").val());
      var shop = get_string($("#shop").val());
      var end = get_string($("#end").text());

      var baseurl = document.URL;
      var url = home + 'php/post_nearby_shop.php';
      var params = new Object();
      params.oi = openid;
      params.e = end;
      params.n = shop;
      params.cid = cat_id;
      if (restroom != null) params.rt = 1;
      if (att_ids != null) params.aid = att_ids;
      if (business_hours != null) params.bh = business_hours;
      if (services != null) params.sv = services;
      if (products != null) params.pd = products;
      if (content != null) params.ct = content;
      if (free_parking != null) params.fp = free_parking;
      if (free_wifi != null) params.fw = free_wifi;
      if (cards != null) params.cd = cards;
      if (weixin != null) params.wx = weixin;
      if (qq != null) params.qq = qq;
      if (phone != null) params.phn = phone;
      if (address != null) params.add = address;

      $.post(url, params, 
        function(d) {
          if (d.result){
            window.location.href = home + "nearby-shops.htm#oi=" + openid;
          }
          else {
            alert(hashMap.Get(String(d.error)));
          }
          $("#postShop").removeAttr("disabled");
      }, "json")
      .fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        alert( "网络出现问题，请刷新页面。" );
        $("#postShop").removeAttr("disabled");
      });
    }
    else{
      $(this).removeAttr("disabled");
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

  function show_attributes(parent_id){
    $('#att_tag_div').find(".myerror").remove();
    $('#att_tag_label').hide();
    $('#att_tag_div').hide();
    $('#att_tag_div').html("");
    if (parent_id > 0){
      var atts = get_attributes_by_category_id(shop_categories, parent_id);
      if (atts.length > 0){
        $('#att_tag_label').show();
        $('#att_tag_div').show();
        var div = $('<div />');
        var label = $('<label />');
        var input = $('<input />').attr("type","checkbox");
        for (var i = 0; i < atts.length; i++){
          var att = atts[i];
          var row;
          if (att.a == null){
            row = div.clone().append(label.clone().attr("for","aid_"+att.i.toString()).append(att.n)).append(input.clone().attr("id","aid_"+att.i.toString()).attr("value",att.i.toString()));
          }
          else{
            row = div.clone().append(label.clone().append(att.n + "："));
            var label2 = label.clone().addClass("mgr10");
            var sub_atts = att.a;
            for (var j = 0; j < sub_atts.length; j++){
              var sub_att = sub_atts[j];
              row = row.append(input.clone().attr("id","aid_"+sub_att.i.toString()).attr("value",sub_att.i.toString())).append(label2.clone().attr("for","aid_"+sub_att.i.toString()).append(sub_att.n));
            }
          }
          $('#att_tag_div').append(row);
        }
      }
      $("#att_tag_div input").click(function(event){
        $('#att_tag_div').find(".myerror").remove();
        var count = 0;
        $("#att_tag_div input:checked").each(function(){
          count++;
        });
        if (count > 10){
          valid = false;
          $('#att_tag_div').append($('<div/>').addClass('myerror').css("color", "red").append("最多请选择10项类别标签"));;
        }
      });
    }
  }

});