$(document).ready(function(){

  $('#tab-list').bind('click', tabHandler);
  $('#tab-list').bind('click', function(){
    var id = $("#community-id").val();
    if (Number(id) > 0){
      var t = $('#l_' + id).offset();
      if (t.hasOwnProperty('top')){
        $('html, body').animate({
          scrollTop: t.top
        }, 0);
      }
    }
  });
  $('#back').click(function(event){
    if ($('#tab-list').hasClass("ui-tab-item-current") || $('#tab-houses').hasClass("ui-tab-item-current")){
      $('#tab-detail').click();
    }
    else {
      $('#tab-list').click();
    }
  });
  var tab_detail_disabled = true;
  var tab_houses_disabled = true;

  var baseurl = document.URL;
  var home = baseurl.substring(0, baseurl.lastIndexOf('/')) + "/";
  var page = new Object();
  page.t = 0; // total pages
  page.i = 0; // current page
  page.n = 20; // communities per page
  var position = new Object(); // user GPS positiion
  position.lat = null; // latitude
  position.lng = null; // longitude
  var communities = new Array();

  var html_p = $("<p />").addClass("detail-top").addClass("lh20");
  var html_searching = html_p.clone().attr("id", "searching").append("搜索中...");
  var html_notfound = html_p.clone().attr("id", "notfound").append("附近5公里以内，没有楼盘信息。");
  var html_prompt = html_p.clone().attr("id", "prompt").append("目前仅提供长沙境内楼盘信息。");

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
      $("#communities-list").append(html_searching);
      get_communities(openid);
    }
  }

  function get_ids(){
    var obj = new Object();
    var hash = new Object();
    var start = page.i * page.n;
    var end = start + page.n;
    if (end > communities.length){
      end = communities.length;
    }
    var ids = "";
    for (var i = start; i < end; i++){
      var community = communities[i];
      ids = ids + "," + community.id;
      var community_location = new Object();
      community_location.lat = community.lat;
      community_location.lng = community.lng;
      community_location.d = community.d;
      hash[String(community.id)] = community_location;
    }
    if (ids.length > 0){
      ids = ids.substr(1);
    }
    obj.ids = ids;
    obj.hash = hash;
    return obj;
  }

  function store_ids(rcommunities){
    var cs = new Array();
    for (var i = 0; i < rcommunities.length; i++){
      var rcommunity = rcommunities[i];
      if (i < page.n){
        cs.push(rcommunity);
      }
      var community = new Object();
      community.id = rcommunity.i;
      community.lat = rcommunity.lat;
      community.lng = rcommunity.lng;
      community.d = rcommunity.d;
      communities.push(community);
    }
    return cs;
  }

  function merge_communities_ids(rcommunities, hash){
    for (var i = 0; i < rhires.length; i++){
      var rcommunity = rcommunities[i];
      var community_location = hash[String(rcommunity.i)];
      if (community_location != null){
        rcommunity.lat = community_location.lat;
        rcommunity.lng = community_location.lng;
        rcommunity.d = community_location.d;
      }
    }
    return rcommunities;
  }

  function display_communities(rcommunities){
    $("#communities-list").find("#searching").remove();
    if (rcommunities.length == 0){
      if (page.i == 1){
        $("#communities-list").append(html_notfound);
        $("#communities-list").append(html_prompt);
      }
    }
    else{
      var li = $("<li />").addClass("list-item");
      var div_row = $("<div />");
      var div_row_fc = div_row.clone().addClass("fc");
      var div_row_fb = div_row_fc.clone().addClass("fb");
      var div_community = div_row.clone().addClass("list-title fl fb w85");
      var div_distance = div_row.clone().addClass("fr");
      var div_house_ratio = div_row.clone().addClass("fl fb w50");
      var div_plant_ratio = div_row.clone().addClass("fr fb");
      var div_sale_date = div_house_ratio.clone();
      var div_finished_date = div_plant_ratio.clone();
      for (var i = 0; i < rcommunities.length; i++){
        var rcommunity = rcommunities[i];
        var hr = null;
        if (rcommunity.ta != null && rcommunity.ha != null && rcommunity.ta <= rcommunity.ha){
          hr = String(Math.round(rcommunity.ha * 100 / rcommunity.ta) / 100);
        }
        else if (rcommunity.hr != null && rcommunity.hr >= 1) {
          hr = String(Math.round(rcommunity.hr * 100) / 100);
        }
        var pr = null;
        if (rcommunity.pr != null && rcommunity.pr > 0 && rcommunity.pr < 100){
          pr = String(Math.round(rcommunity.pr * 100) / 100);
        }
        var sd = null;
        if (rcommunity.sd != null){
          sd = rcommunity.sd.slice(0,7);
        }
        var fd = null;
        if (rcommunity.fd != null){
          fd = rcommunity.fd.slice(0,7);
        }
        var row = li.clone().attr("data-i", rcommunity.i).attr("data-lat", rcommunity.lat).attr("data-lng", rcommunity.lng).attr("data-d", rcommunity.d).attr("data-n", rcommunity.n).attr("data-ta", rcommunity.ta == null ? "" : rcommunity.ta).attr("data-ha", rcommunity.ha == null ? "" : rcommunity.ha).attr("data-hr", hr == null ? "" : hr).attr("data-pr", pr == null ? "" : pr).attr("data-sd", sd == null ? "" : sd).attr("data-fd", fd == null ? "" : fd).attr("id", "l_"+rcommunity.i);
        row = row
          .append(div_row.clone().append(div_community.clone().append(rcommunity.n)).append(div_distance.clone().append(String(Math.ceil(rcommunity.d * 100)*10) + "米")));
        if (hr != null || pr != null){
          row = row
            .append(div_row_fc.clone().append(div_house_ratio.clone().append(hr == null ? "" : "容积率: "+hr)).append(div_plant_ratio.clone().append(pr == null ? "" : "绿化率: " + pr + "%")));
        }
        if (sd != null || fd != null){
          row = row
            .append(div_row_fb.clone().append(div_sale_date.clone().append(sd == null ? "" : "开盘: "+sd)).append(div_finished_date.clone().append(fd == null ? "" : "竣工: "+fd)))
        }
        row = row.append(div_row_fc.clone());

        $("#communities-list").append(row);
      }

      if (page.i * page.n < page.t){
        $("#more").show();
      }

      $("#communities-list .list-item").click(function(event){
        var community = new Object();
        community.i = $(this).attr("data-i");
        community.lat = $(this).attr("data-lat");
        community.lng = $(this).attr("data-lng");
        community.d = $(this).attr("data-d") != null ? Number($(this).attr("data-d")) : 0;
        community.n = $(this).attr("data-n");
        community.ta = $(this).attr("data-ta") == "" ? null : Number($(this).attr("data-ta"));
        community.ha = $(this).attr("data-ha") == "" ? null : Number($(this).attr("data-ha"));
        community.hr = $(this).attr("data-hr") == "" ? null : $(this).attr("data-hr");
        community.pr = $(this).attr("data-pr") == "" ? null : $(this).attr("data-pr");
        community.sd = $(this).attr("data-sd") == "" ? null : $(this).attr("data-sd");
        community.fd = $(this).attr("data-fd") == "" ? null : $(this).attr("data-fd");

        get_community(community);
      });
    }
  }

  function get_communities(openid){
    // get nearby communities
    var url = home + 'php/get_nearby_communities.php';
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
          var cs = null;
          if (page.i == 1) {// first page
            page.t = d.t;
            position.lat = d.lat;
            position.lng = d.lng;
            cs = store_ids(d.c);
          }
          else{
            cs = merge_communities_ids(d.c, hash);
          }
          display_communities(cs);
        }
    }, "json")
    .fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ", " + error;
      alert( "网络出现问题，请刷新页面。" );
    });
  }

  function merge_community(rcommunity, community){
    community.dev = rcommunity.dev;
    community.ope = rcommunity.ope;
    community.des = rcommunity.des;
    community.con = rcommunity.con;
    community.o = rcommunity.o;
    community.phn = rcommunity.phn;
    community.add = rcommunity.add;
    return community;
  }

  function display_community(rcommunity){
    $("#community-id").val(rcommunity.i);

    $("#community").text(rcommunity.n);
    var cdetail1 = "";
    if (rcommunity.ta != null){
      cdetail1 += "<div>总占地面积：<span>"+rcommunity.ta.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"</span>m²</div>";
    }
    if (rcommunity.ha != null){
      cdetail1 += "<div>总建筑面积：<span>"+rcommunity.ha.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"</span>m²</div>";
    }
    if (rcommunity.hr != null){
      cdetail1 += "<div>容积率：<span>"+rcommunity.hr+"</span></div>";
    }
    if (rcommunity.pr != null){
      cdetail1 += "<div>绿化率：<span>"+rcommunity.pr+"</span>%</div>";
    }
    if (rcommunity.sd != null){
      cdetail1 += "<div>开盘日期：<span>"+rcommunity.sd+"</span></div>";
    }
    if (rcommunity.fd != null){
      cdetail1 += "<div>竣工日期：<span>"+rcommunity.fd+"</span></div>";
    }
    $("#cdetail1").html(cdetail1);

    var cdetail2 = "";
    if (rcommunity.dev != null){
      cdetail2 += "<div>开发商：<span>"+rcommunity.dev+"</span></div>";
    }
    if (rcommunity.ope != null){
      cdetail2 += "<div>物业公司：<span>"+rcommunity.ope+"</span></div>";
    }
    if (rcommunity.des != null){
      cdetail2 += "<div>设计单位：<span>"+rcommunity.des+"</span></div>";
    }
    if (rcommunity.con != null){
      cdetail2 += "<div>施工单位：<span>"+rcommunity.con+"</span></div>";
    }
    $("#cdetail2").html(cdetail2);

    $("#description").html(rcommunity.o);

    if (rcommunity.phn != null && rcommunity.phn.length > 0){
      var tag_a = '<a href="tel:phone">phone [<span class="call">拨打</span>]</a><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
      var phones = rcommunity.phn.split(",");
      var html_phones = "";
      for (var i = 0; i < phones.length; i++){
        var phone = phones[i];
        html_phones += tag_a.replace(/phone/g, phone);
      }
      if (html_phones.length > 0){
        html_phones = html_phones.substr(0, html_phones.length - 5 - 10*6);
      }
      $("#phone-div").show().html("销售：" + html_phones);
    }
    else{
      $("#phone-div").hide().html("");
    }

    if (rcommunity.add != null && rcommunity.add.length > 0){
      $("#address-div").show().html("地址：<span>" + rcommunity.add + "</span>");
    }
    else{
      $("#address-div").hide().html("");
    }
    
    var target = new Object();
    target.lng = rcommunity.lng;
    target.lat = rcommunity.lat;
    target.add = rcommunity.add;
    map_click(target);
  }

  function get_community(community){
    // get nearby community
    var url = home + 'php/get_nearby_community.php';
    var params = new Object();
    params.c = community.i;

    $.post(url, params, 
      function(d) {
        if (d.result != null && d.result == 0){
          alert(hashMap.Get(String(d.error)));
        }
        else {
          var cs = merge_community(d, community);
          display_community(cs);
          if (tab_detail_disabled){
            $('#tab-detail').bind('click', tabHandler);
            $('#tab-detail').bind('click', function(){window.scrollTo(0, 0);});
            tab_detail_disabled = false;
          }
          $('#tab-detail').click();

          $("#for-sale-btn").show();
          $("#for-sale-block").hide();
          $("#for-sale-total").text("");
          $("#for-sale-list").html("");

          $("#buildings-btn").show();
          $("#buildings-block").hide();
          $("#buildings-total").text("");
          $("#buildings-list").html("");

          $('#tab-houses').unbind('click');
          $("#houses-list").html("");
          tab_houses_disabled = true;
        }
    }, "json")
    .fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ", " + error;
      alert( "网络出现问题，请刷新页面。" );
    });
  }

  $('#more').click(function(){
    $(this).hide();
    $("#communities-list").append(html_searching);
    var openid = $("#openid").val();
    get_communities(openid);
  });

  $("#for-sale-btn").click(function(){
    var community_id = $("#community-id").val();
    // get nearby community for sale list
    var url = home + 'php/get_nearby_community_for_sale_house_types.php';
    var params = new Object();
    params.c = community_id;

    $.post(url, params, 
      function(d) {
        if (d.result != null && d.result == 0){
          alert(hashMap.Get(String(d.error)));
        }
        else {
          $("#for-sale-btn").hide();
          $("#for-sale-block").show();
          $("#for-sale-total").text("("+d.t.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+")");
          if (d.t > 0 && d.ts != null){
            var li = $("<li />").addClass("list-item");
            var div_row = $("<div />");
            var div_row_fc = div_row.clone().addClass("fc");
            var div_row_fb = div_row_fc.clone().addClass("fb");
            var div_type = div_row.clone().addClass("list-title fl fb w85");
            var div_total = div_row.clone().addClass("fr");
            for (var i = 0; i < d.ts.length; i++){
              var row = li.clone().attr("data-ty", d.ts[i].ty).attr("data-t", d.ts[i].t);
              row = row
                .append(div_row.clone().append(div_type.clone().append(d.ts[i].ty)).append(div_total.clone().append("("+d.ts[i].t.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+")")));
              row = row.append(div_row_fc.clone());
              $("#for-sale-list").append(row);
            }

            $("#for-sale-list .list-item").click(function(){
              var openid = $("#openid").val();
              var community_id = $("#community-id").val();
              var type = $(this).attr("data-ty");
              var url = home + 'php/get_nearby_community_for_sale_houses.php';
              var params = new Object();
              params.oi = openid;
              params.c = community_id;
              params.t = type;

              $.post(url, params, 
                function(d) {
                  if (d.result != null && d.result == 0){
                    alert(hashMap.Get(String(d.error)));
                  }
                  else {
                    $("#houses-list").html("");
                    if (tab_houses_disabled){
                      $('#tab-houses').bind('click', tabHandler);
                      $('#tab-houses').bind('click', function(){window.scrollTo(0, 0);});
                      tab_houses_disabled = false;
                    }
                    $('#tab-houses').click();
                    var li = $("<li />").addClass("list-item");
                    var div_row = $("<div />");
                    var div_row_fc = div_row.clone().addClass("fc");
                    var div_row_fb = div_row_fc.clone().addClass("fb");
                    var div_building = div_row.clone().addClass("list-title fl fb w85");
                    var div_btotal = div_row.clone().addClass("fr");
                    var div_floor = div_row.clone().addClass("list-title fl fb w85");
                    var div_ftotal = div_row.clone().addClass("fr");
                    var div_house = div_row.clone().addClass("list-title fl fb w85");
                    var div_status = div_row.clone().addClass("fr");
                    var div_outer = div_row.clone().addClass("fl fb w50");
                    var div_inner = div_row.clone().addClass("fr fb");
                    var div_type = div_row.clone().addClass("fl fb w50");
                    var div_asking = div_row.clone().addClass("fr fb");
                    var div_sold = div_row.clone().addClass("fl fb w70");
                    var div_date = div_row.clone().addClass("fr fb");
                    if (!(d.cr >= 50)){
                      $("#houses-list").append(li.clone().append(div_row.clone().append("信用等级不够，无法查看价格。")));
                    }
                    if (d.t > 0 && d.bs != null){
                      for (var i = 0; i < d.bs.length; i++){
                        var b = d.bs[i];
                        var row = li.clone().addClass("detail-label")
                          .append(div_row.clone().append(div_building.clone().append(b.b)).append(div_btotal.clone().append("("+b.t.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+")")));
                        row = row.append(div_row_fc.clone());
                        $("#houses-list").append(row);
                        for (var j = 0; j < b.fs.length; j++){
                          var f = b.fs[j];
                          var row = li.clone()
                            .append(div_row.clone().append(div_floor.clone().append("楼层："+f.f)).append(div_ftotal.clone().append("("+f.t.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+")")));
                          row = row.append(div_row_fc.clone());
                          $("#houses-list").append(row);
                          for (var k = 0; k < f.hs.length; k++){
                            var h = f.hs[k];
                            var s = h.s == null ? "不可售" : (h.s == 0 ? "可售" : (h.s == 1 ? "已售" : "不详"));
                            var row = li.clone()
                              .append(div_row.clone().append(div_house.clone().append("房号："+h.h)).append(div_status.clone().append(s)));
                            var oa = null;
                            if (h.oa != null && h.oa > 0){
                              oa = "建筑：" + h.oa.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"m²";
                            }
                            var ia = null;
                            if (h.ia != null && h.ia > 0){
                              ia = "套内：" + h.ia.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"m²";
                            }
                            if (oa != null || ia != null){
                              row = row
                                .append(div_row_fc.clone().append(div_outer.clone().append(oa == null ? "" : oa)).append(div_inner.clone().append(ia == null ? "" : ia)));
                            }
                            var ap = null;
                            if (h.ap != null && h.ap > 0){
                              ap = "备案价：" + h.ap.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"元/m²";
                            }
                            row = row
                              .append(div_row_fc.clone().append(div_type.clone().append(h.t)).append(div_asking.clone().append(ap == null ? "" : ap)));
                            var sp = null;
                            if (h.sp != null && h.sp > 0){
                              sp = "网签价：" + h.sp.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"元/m²";
                            }
                            var sd = null;
                            if (h.sd != null){
                              sd = "网签日：" + h.sd.slice(0,10);
                            }
                            if (sp != null || sd != null){
                              row = row
                                .append(div_row_fc.clone().append(div_sold.clone().append(sp == null ? "" : sp)).append(div_date.clone().append(sd == null ? "" : sd)));
                            }
                            row = row.append(div_row_fc.clone());
                            $("#houses-list").append(row);
                          }
                        }
                      }
                    }
                    else{
                      $("#houses-list").append(li.clone().append(div_row.clone().append("暂无信息。")));
                    }
                  }
                }, "json")
                .fail(function( jqxhr, textStatus, error ) {
                  var err = textStatus + ", " + error;
                  alert( "网络出现问题，请刷新页面。" );
                });
              });
            }
        }
    }, "json")
    .fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ", " + error;
      alert( "网络出现问题，请刷新页面。" );
    });
  });

  $("#buildings-btn").click(function(){
    var community_id = $("#community-id").val();
    // get nearby community for sale list
    var url = home + 'php/get_nearby_community_buildings.php';
    var params = new Object();
    params.c = community_id;

    $.post(url, params, 
      function(d) {
        if (d.result != null && d.result == 0){
          alert(hashMap.Get(String(d.error)));
        }
        else {
          $("#buildings-btn").hide();
          $("#buildings-block").show();
          $("#buildings-total").text("");
          if (d.bs != null && d.bs.length > 0){
            var li = $("<li />").addClass("list-item");
            var div_row = $("<div />");
            var div_row_fc = div_row.clone().addClass("fc");
            var div_row_fb = div_row_fc.clone().addClass("fb");
            var div_building = div_row.clone().addClass("list-title fl fb");
            var div_date = div_row.clone().addClass("fl fb");
            for (var i = 0; i < d.bs.length; i++){
              var b = d.bs[i];
              var row = li.clone().attr("data-i", b.i).attr("data-n", b.n).attr("data-d", b.d).attr("data-sp", b.sp).attr("data-p", b.p).attr("data-l", b.l).attr("data-lp", b.lp).attr("data-c", b.c).attr("data-cp", b.cp);
              row = row.append(div_row.clone().append(div_building.clone().append(b.n)));
              if (b.d != null){
                row = row.append(div_row_fc.clone().append(div_date.clone().append("批准预售："+b.d.slice(0,10))));
              }
              if (b.sp != null){
                row = row.append(div_row_fc.clone().append(div_date.clone().append("预售证号："+b.sp)));
              }
              if (b.p != null){
                row = row.append(div_row_fc.clone().append(div_date.clone().append("产权证号："+b.p)));
              }
              if (b.l != null){
                row = row.append(div_row_fc.clone().append(div_date.clone().append("国土证号："+b.l)));
              }
              if (b.lp != null){
                row = row.append(div_row_fc.clone().append(div_date.clone().append("用地规划许可证号："+b.lp)));
              }
              if (b.c != null){
                row = row.append(div_row_fc.clone().append(div_date.clone().append("工程施工许可证号："+b.c)));
              }
              if (b.cp != null){
                row = row.append(div_row_fc.clone().append(div_date.clone().append("工程规划许可证号："+b.cp)));
              }
              row = row.append(div_row_fc.clone());
              $("#buildings-list").append(row);
            }

            $("#buildings-list .list-item").click(function(){
              var openid = $("#openid").val();
              var community_id = $("#community-id").val();
              var building_id = $(this).attr("data-i");
              var url = home + 'php/get_nearby_community_building_houses.php';
              var params = new Object();
              params.oi = openid;
              params.c = community_id;
              params.b = building_id;

              $.post(url, params, 
                function(d) {
                  if (d.result != null && d.result == 0){
                    alert(hashMap.Get(String(d.error)));
                  }
                  else {
                    $("#houses-list").html("");
                    if (tab_houses_disabled){
                      $('#tab-houses').bind('click', tabHandler);
                      $('#tab-houses').bind('click', function(){window.scrollTo(0, 0);});
                      tab_houses_disabled = false;
                    }
                    $('#tab-houses').click();
                    var li = $("<li />").addClass("list-item");
                    var div_row = $("<div />");
                    var div_row_fc = div_row.clone().addClass("fc");
                    var div_row_fb = div_row_fc.clone().addClass("fb");
                    var div_building = div_row.clone().addClass("list-title fl fb w85").append("总户数");
                    var div_btotal = div_row.clone().addClass("fr");
                    var div_floor = div_row.clone().addClass("list-title fl fb w85");
                    var div_ftotal = div_row.clone().addClass("fr");
                    var div_house = div_row.clone().addClass("list-title fl fb w85");
                    var div_status = div_row.clone().addClass("fr");
                    var div_outer = div_row.clone().addClass("fl fb w50");
                    var div_inner = div_row.clone().addClass("fr fb");
                    var div_type = div_row.clone().addClass("fl fb w50");
                    var div_asking = div_row.clone().addClass("fr fb");
                    var div_sold = div_row.clone().addClass("fl fb w70");
                    var div_date = div_row.clone().addClass("fr fb");
                    if (!(d.cr >= 50)){
                      $("#houses-list").append(li.clone().append(div_row.clone().append("信用等级不够，无法查看价格。")));
                    }
                    if (d.t > 0 && d.fs != null){
                      var row = li.clone()
                        .append(div_row.clone().append(div_building.clone()).append(div_btotal.clone().append("("+d.t.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+")")));
                      row = row.append(div_row_fc.clone());
                      $("#houses-list").append(row);
                      for (var j = 0; j < d.fs.length; j++){
                        var f = d.fs[j];
                        var row = li.clone().addClass("detail-label")
                          .append(div_row.clone().append(div_floor.clone().append("楼层："+f.f)).append(div_ftotal.clone().append("("+f.t.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+")")));
                        row = row.append(div_row_fc.clone());
                        $("#houses-list").append(row);
                        for (var k = 0; k < f.hs.length; k++){
                          var h = f.hs[k];
                          var s = h.s == null ? "不可售" : (h.s == 0 ? "可售" : (h.s == 1 ? "已售" : "不详"));
                          var row = li.clone()
                            .append(div_row.clone().append(div_house.clone().append("房号："+h.h)).append(div_status.clone().append(s)));
                          var oa = null;
                          if (h.oa != null && h.oa > 0){
                            oa = "建筑：" + h.oa.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"m²";
                          }
                          var ia = null;
                          if (h.ia != null && h.ia > 0){
                            ia = "套内：" + h.ia.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"m²";
                          }
                          if (oa != null || ia != null){
                            row = row
                              .append(div_row.clone().append(div_outer.clone().append(oa == null ? "" : oa)).append(div_inner.clone().append(ia == null ? "" : ia)));
                          }
                          var ap = null;
                          if (h.ap != null && h.ap > 0){
                            ap = "备案价：" + h.ap.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"元/m²";
                          }
                          row = row
                            .append(div_row.clone().append(div_type.clone().append(h.t)).append(div_asking.clone().append(ap == null ? "" : ap)));
                          var sp = null;
                          if (h.sp != null && h.sp > 0){
                            sp = "网签价：" + h.sp.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"元/m²";
                          }
                          var sd = null;
                          if (h.sd != null){
                            sd = "网签日：" + h.sd.slice(0,10);
                          }
                          if (sp != null || sd != null){
                            row = row
                              .append(div_row.clone().append(div_sold.clone().append(sp == null ? "" : sp)).append(div_date.clone().append(sd == null ? "" : sd)));
                          }
                          row = row.append(div_row_fc.clone());
                          $("#houses-list").append(row);
                        }
                      }
                    }
                    else{
                      $("#houses-list").append(li.clone().append(div_row.clone().append("暂无信息。")));
                    }
                  }
                }, "json")
                .fail(function( jqxhr, textStatus, error ) {
                  var err = textStatus + ", " + error;
                  alert( "网络出现问题，请刷新页面。" );
                });
              });
            }
        }
    }, "json")
    .fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ", " + error;
      alert( "网络出现问题，请刷新页面。" );
    });
  });

});