$(document).ready(function(){

  $('#tab-list').bind('click', tabHandler);
  $('#tab-list').bind('click', function(){
    var id = $("#complaint-job-id").val();
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
  page.n = 20; // jobs per page
  var position = new Object(); // user GPS positiion
  position.lat = null; // latitude
  position.lng = null; // longitude
  var jobs = new Array();

  var html_p = $("<p />").addClass("detail-top").addClass("lh20");
  var html_searching = html_p.clone().attr("id", "searching").append("搜索中...");
  var html_notfound = html_p.clone().attr("id", "notfound").append("附近5公里以内，没有招工信息。");
  var html_prompt = html_p.clone().attr("id", "prompt").append("发布招工信息，获取信用积分。");

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
      get_jobs(openid);
    }
  }

  function get_ids(){
    var obj = new Object();
    var hash = new Object();
    var start = page.i * page.n;
    var end = start + page.n;
    if (end > jobs.length){
      end = jobs.length;
    }
    var ids = "";
    for (var i = start; i < end; i++){
      var job = jobs[i];
      ids = ids + "," + job.id;
      var job_location = new Object();
      job_location.lat = job.lat;
      job_location.lng = job.lng;
      job_location.d = job.d;
      hash[String(job.id)] = job_location;
    }
    if (ids.length > 0){
      ids = ids.substr(1);
    }
    obj.ids = ids;
    obj.hash = hash;
    return obj;
  }

  function store_ids(rjobs){
    var js = new Array();
    for (var i = 0; i < rjobs.length; i++){
      var rjob = rjobs[i];
      if (i < page.n){
        js.push(rjob);
      }
      var job = new Object();
      job.id = rjob.i;
      job.lat = rjob.lat;
      job.lng = rjob.lng;
      job.d = rjob.d;
      jobs.push(job);
    }
    return js;
  }

  function merge_jobs_ids(rjobs, hash){
    for (var i = 0; i < rjobs.length; i++){
      var rjob = rjobs[i];
      var job_location = hash[String(rjob.i)];
      if (job_location != null){
        rjob.lat = job_location.lat;
        rjob.lng = job_location.lng;
        rjob.d = job_location.d;
      }
    }
    return rjobs;
  }

  function display_jobs(rjobs){
    $(".list").find("#searching").remove();
    if (rjobs.length == 0){
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
      var div_job = div_row.clone().addClass("list-title fl fb w80");
      var div_company = div_row.clone().addClass("fl fb w80");
      var div_distance = div_row.clone().addClass("fr");
      var div_salary = div_row.clone().addClass("fl");
      var div_requirement = div_row.clone().addClass("fl fb");
      var div_date = div_distance.clone();
      for (var i = 0; i < rjobs.length; i++){
        var rjob = rjobs[i];
        var row = li.clone().attr("data-i", rjob.i).attr("data-lat", rjob.lat).attr("data-lng", rjob.lng).attr("data-d", rjob.d).attr("data-s", rjob.s).attr("data-t", rjob.t).attr("data-ty", rjob.ty).attr("data-sx", rjob.sx).attr("data-al", rjob.al).attr("data-ah", rjob.ah).attr("data-hl", rjob.hl).attr("data-hh", rjob.hh).attr("data-edu", rjob.edu).attr("data-exp", rjob.exp).attr("data-sl", rjob.sl).attr("data-sh", rjob.sh).attr("data-c", rjob.c).attr("id", "l_"+rjob.i);
        row = row
          .append(div_row.clone().append(div_job.clone().append(rjob.t)).append(div_distance.clone().append(worktypes[rjob.ty-1])))
          .append(div_row_fc.clone().append(div_company.clone().append(rjob.c)).append(div_distance.clone().append(String(Math.ceil(rjob.d * 100)*10) + "米")));
        var salary = "";
        if (rjob.sl != null && rjob.sh != null && rjob.sl > 0 && rjob.sh > 0){
          salary = String(rjob.sl) + "~" + String(rjob.sh) + "元";
        }
        else if (rjob.sl != null && rjob.sl > 0){
          salary = String(rjob.sl) + "元以上";
        }
        else if (rjob.sh != null && rjob.sh > 0){
          salary = String(rjob.sh) + "元以下";
        }
        var requirement = "";
        if (rjob.edu != null && rjob.edu > 0){
          requirement += "&middot;" + educations[rjob.edu-1];
          if (rjob.edu > 1 && rjob.edu < 6){
            requirement += "以上";
          }
          requirement += "学历";
        }
        if (rjob.exp != null && rjob.exp > 0){
          requirement += "&middot;" + String(rjob.exp) + "年以上经验";
        }
        if (rjob.sx != null){
          if (rjob.sx == 0){
            requirement += "&middot;" + "女";
          }
          else {
            requirement += "&middot;" + "男";
          }
        }
        if (rjob.al != null && rjob.ah != null && rjob.al > 0 && rjob.ah > 0){
          requirement += "&middot;" + String(rjob.al) + "~" + String(rjob.ah) + "岁";
        }
        else if (rjob.al != null && rjob.al > 0){
          requirement += "&middot;" + String(rjob.al) + "岁以上";
        }
        else if (rjob.ah != null && rjob.ah > 0){
          requirement += "&middot;" + String(rjob.ah) + "岁以下";
        }
        if (rjob.hl != null && rjob.hh != null && rjob.hl > 0 && rjob.hh > 0){
          requirement += "&middot;" + String(rjob.hl) + "~" + String(rjob.hh) + "公分";
        }
        else if (rjob.hl != null && rjob.hl > 0){
          requirement += "&middot;" + String(rjob.hl) + "公分以上";
        }
        else if (rjob.hh != null && rjob.hh > 0){
          requirement += "&middot;" + String(rjob.hh) + "公分以下";
        }
        var div_row_3 = div_row_fb.clone();
        if (salary.length > 0){
          div_row_3 = div_row_3.append(div_salary.clone().append(salary));
        }
        div_row_3 = div_row_3.append(div_date.clone().append(rjob.s.slice(0,10)));
        row = row.append(div_row_3).append(div_row_fc.clone());
        if (requirement.length > 0){
          requirement = requirement.substr(8);
        }
        if (requirement.length > 0){
          row = row.append(div_row_fb.clone().append(div_requirement.clone().append(requirement)));
        }

        $(".list").append(row);
      }

      if (page.i * page.n < page.t){
        $("#more").show();
      }

      $(".list-item").click(function(event){
        var job = new Object();
        job.i = $(this).attr("data-i");
        job.lat = $(this).attr("data-lat");
        job.lng = $(this).attr("data-lng");
        job.d = $(this).attr("data-d") != null ? Number($(this).attr("data-d")) : 0;
        job.s = $(this).attr("data-s");
        job.t = $(this).attr("data-t");
        job.ty = $(this).attr("data-ty");
        job.sx = $(this).attr("data-sx");
        job.al = $(this).attr("data-al");
        job.ah = $(this).attr("data-ah");
        job.hl = $(this).attr("data-hl");
        job.hh = $(this).attr("data-hh");
        job.edu = $(this).attr("data-edu");
        job.exp = $(this).attr("data-exp");
        job.sl = $(this).attr("data-sl") != null ? Number($(this).attr("data-sl")) : null;
        job.sh = $(this).attr("data-sh") != null ? Number($(this).attr("data-sh")) : null;
        job.c = $(this).attr("data-c");

        get_job(job);
      });
    }
  }

  function get_jobs(openid){
    // get nearby jobs
    var url = home + 'php/get_nearby_jobs.php';
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
          var js = null;
          if (page.i == 1) {// first page
            page.t = d.t;
            position.lat = d.lat;
            position.lng = d.lng;
            js = store_ids(d.j);
          }
          else{
            js = merge_jobs_ids(d.j, hash);
          }
          display_jobs(js);
        }
    }, "json")
    .fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ", " + error;
      alert( "网络出现问题，请刷新页面。" );
    });
  }

  function merge_job(rjob, job){
    job.e = rjob.e;
    job.ss = rjob.ss;
    job.hf = rjob.hf;
    job.av = rjob.av;
    job.hs = rjob.hs;
    job.ml = rjob.ml;
    job.tr = rjob.tr;
    job.ot = rjob.ot;
    job.ns = rjob.ns;
    job.rqr = rjob.rqr;
    job.dsc = rjob.dsc;
    job.bnf = rjob.bnf;
    job.wx = rjob.wx;
    job.qq = rjob.qq;
    job.phn = rjob.phn;
    job.eml = rjob.eml;
    job.add = rjob.add;
    job.vws = rjob.vws;
    return job;
  }

  function display_job(job){
    var salary = "";
    if (job.sl != null && job.sh != null && job.sl > 0 && job.sh > 0){
      salary = job.sl.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "~" + job.sh.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "元";
    }
    else if (job.sl != null && job.sl > 0){
      salary = job.sl.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "元以上";
    }
    else if (job.sh != null && job.sh > 0){
      salary = job.sh.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "元以下";
    }

    var requirement = "";
    if (job.ty != null && job.ty > 0){
      requirement += "&middot;" + worktypes[job.ty-1];
    }
    if (job.edu != null && job.edu > 0){
      requirement += "&middot;" + educations[job.edu-1];
      if (job.edu > 1 && job.edu < 6){
        requirement += "以上";
      }
      requirement += "学历";
    }
    if (job.exp != null && job.exp > 0){
      requirement += "&middot;" + String(job.exp) + "年以上经验";
    }
    if (job.sx != null){
      if (job.sx == 0){
        requirement += "&middot;" + "女";
      }
      else {
        requirement += "&middot;" + "男";
      }
    }
    if (job.al != null && job.ah != null && job.al > 0 && job.ah > 0){
      requirement += "&middot;" + String(job.al) + "~" + String(job.ah) + "岁";
    }
    else if (job.al != null && job.al > 0){
      requirement += "&middot;" + String(job.al) + "岁以上";
    }
    else if (job.ah != null && job.ah > 0){
      requirement += "&middot;" + String(job.ah) + "岁以下";
    }
    if (job.hl != null && job.hh != null && job.hl > 0 && job.hh > 0){
      requirement += "&middot;" + String(job.hl) + "~" + String(job.hh) + "公分";
    }
    else if (job.hl != null && job.hl > 0){
      requirement += "&middot;" + String(job.hl) + "公分以上";
    }
    else if (job.hh != null && job.hh > 0){
      requirement += "&middot;" + String(job.hh) + "公分以下";
    }
    if (requirement.length > 0){
      requirement = requirement.substr(8);
    }

    var benefit = "";
    if (job.ss){
      benefit += "&middot;" + "社保";
    }
    if (job.hf){
      benefit += "&middot;" + "公积金";
    }
    if (job.av){
      benefit += "&middot;" + "年休假";
    }
    if (job.hs){
      benefit += "&middot;" + "住宿";
    }
    if (job.ml){
      benefit += "&middot;" + "工作餐";
    }
    if (job.tr){
      benefit += "&middot;" + "无出差";
    }
    if (job.ot){
      benefit += "&middot;" + "无加班";
    }
    if (job.ns){
      benefit += "&middot;" + "无夜班";
    }
    if (benefit.length > 0){
      benefit = benefit.substr(8);
    }

    $("#complaint-job-id").val(job.i);

    $("#company").text(job.c);
    $("#title").text(job.t);
    $("#postdate").text(job.s.slice(0,10));
    $("#viewed").text(job.vws == null ? "0" : job.vws.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","));

    if (requirement.length > 0){
      $("#requirement-list").show().html(requirement);
    }
    else{
      $("#requirement-list").hide().html("");
    }
    if (salary.length > 0){
      $("#salary").show().html(salary);
    }
    else{
      $("#salary").hide().html("");
    }
    if (benefit.length > 0){
      $("#benefit-list").show().html(benefit);
    }
    else{
      $("#benefit-list").hide().html("");
    }

    if (job.rqr != null && job.rqr.length > 0){
      $("#requirement").html(job.rqr);
      $("#requirement-block").show();
    }
    else{
      $("#requirement-block").hide();
      $("#requirement").html("");
    }
    $("#description").html(job.dsc);
    if (job.bnf != null && job.bnf.length > 0){
      $("#benefit").html(job.bnf);
      $("#benefit-block").show();
    }
    else{
      $("#benefit-block").hide();
      $("#benefit").html("");
    }

    if (job.wx != null && job.wx.length > 0){
      $("#weixin-div").show().html("微信：<span>" + job.wx + "</span>");
    }
    else{
      $("#weixin-div").hide().html("");
    }

    if (job.qq != null && job.qq.length > 0){
      $("#qq-div").show().html("QQ ：<span>" + job.qq + "</span>");
    }
    else{
      $("#qq-div").hide().html("");
    }

    if (job.phn != null && job.phn.length > 0){
      var tag_a = '<a href="tel:phone">phone [<span class="call">拨打</span>]</a><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
      var phones = job.phn.split(",");
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

    if (job.eml != null && job.eml.length > 0){
      var tag_a = '<a href="mailto:email">email</a><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
      var emails = job.eml.split(",");
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

    if (job.add != null && job.add.length > 0){
      $("#address-div").show().html("地址：<span>" + job.add + "</span>");
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

  function get_job(job){
    // get nearby jobs
    var url = home + 'php/get_nearby_job.php';
    var params = new Object();
    params.i = job.i;

    $.post(url, params, 
      function(d) {
        if (d.result != null && d.result == 0){
          alert(hashMap.Get(String(d.error)));
        }
        else {
          var js = merge_job(d, job);
          display_job(js);
          if (tab_detail_disabled){
            $('#tab-detail').bind('click', tabHandler);
            $('#tab-detail').bind('click', function(){window.scrollTo(0, 0);});
            tab_detail_disabled = false;
          }
          $('#tab-detail').click();
          
          if ($('.complaint-win').is(":visible")) {
            $('.complaint-win').hide();
          }
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
    $('#complaint-type-6').parent().find(".myerror").remove();
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
    $('#complaint-type-6').parent().find(".myerror").remove();
    $('#complaint').parent().find(".myerror").remove();
    $('.complaint-type').removeAttr("checked");
    $('#complaint').val('');
  });

  $('#complaint-submit').click(function(){
    var div = $('<div/>').addClass('myerror').css("color", "red");
    var valid = true;
    $('#complaint-type-6').parent().find(".myerror").remove();
    var complaint_type = Number($(".complaint-type:checked").val());
    if (isNaN(complaint_type) || complaint_type <= 0){
      valid = false;
      $('#complaint-type-6').parent().append(div.clone().append("请选择举报类型"));
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
      var id = $("#complaint-job-id").val();

      var url = home + 'php/complaint_job.php';
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
    get_jobs(openid);
  });

});