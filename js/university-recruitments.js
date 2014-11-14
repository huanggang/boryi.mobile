$(document).ready(function(){
  $('#tab-list').bind('click', tabHandler);
  $('#tab-list').bind('click', function(){
    var id = $("#recruitment-id").val();
    if (id != null && id.length > 0){
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
  page.n = 20; // recruitments per page

  var html_p = $("<p />").addClass("detail-top").addClass("lh20");
  var html_searching = html_p.clone().attr("id", "searching").append("搜索中...");
  var html_notfound = html_p.clone().attr("id", "notfound").append("所在学校六个月内未举办招聘会。");
  var html_prompt = html_p.clone().attr("id", "prompt").append("请联系学校就业处。");

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
      get_recruitments(openid);
    }
  }

  function display_recruitments(recruitments){
    $(".list").find("#searching").remove();
    if (recruitments.length == 0){
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
      var div_recruitment = div_row.clone().addClass("list-title fb");
      var div_date = div_row.clone().addClass("fr");
      var div_place = div_row.clone().addClass("fl fb w75");
      for (var i = 0; i < recruitments.length; i++){
        var recruitment = recruitments[i];
        var date = new Date(recruitment.d.slice(0,10));
        var row = li.clone().attr("data-i", recruitment.i).attr("data-n", recruitment.n).attr("data-d", recruitment.d).attr("data-p", recruitment.p).attr("id", "l_"+String(recruitment.i)+String(date.getTime()));
        row = row
          .append(div_row.clone().append(div_recruitment.clone().append(recruitment.n)))
          .append(div_row_fc.clone().append(div_place.clone().append(recruitment.p)).append(div_date.clone().append(recruitment.d.slice(0,10))))
          .append(div_row_fc.clone());

        $(".list").append(row);
      }

      if (page.i * page.n < page.t){
        $("#more").show();
      }

      $(".list-item").click(function(event){
        var recruitment = new Object();
        recruitment.i = $(this).attr("data-i");
        recruitment.n = $(this).attr("data-n");
        recruitment.d = $(this).attr("data-d");
        recruitment.p = $(this).attr("data-p");
        var date = new Date(recruitment.d.slice(0,10));
        $("#recruitment-id").val(String(recruitment.i) + String(date.getTime()));

        get_recruitment(recruitment);
      });
    }
  }

  function get_recruitments(openid){
    // get university recruitments
    var url = home + 'php/get_university_recruitments.php';
    var params = new Object();
    params.oi = openid;
    params.p = page.i;

    $.post(url, params, 
      function(d) {
        if (d.result != null && d.result == 0){
          alert(hashMap.Get(String(d.error)));
        }
        else {
          page.i += 1;
          if (page.i == 1) {// first page
            page.t = d.t;
          }
          display_recruitments(d.r);
        }
    }, "json")
    .fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ", " + error;
      alert( "网络出现问题，请刷新页面。" );
    });
  }

  function merge_recruitment(rrecruitment, recruitment){
    recruitment.o = rrecruitment.o; // overview
    recruitment.b = rrecruitment.b; // benefit
    recruitment.pr = rrecruitment.p; // process
    recruitment.phn = rrecruitment.phn;
    recruitment.eml = rrecruitment.eml;
    recruitment.web = rrecruitment.web;
    recruitment.add = rrecruitment.add;
    recruitment.j = rrecruitment.j;
    return recruitment;
  }

  function display_recruitment(recruitment){
    $("#title").text(recruitment.n);
    $("#date").text(recruitment.d);
    $("#place").text(recruitment.p);

    if (recruitment.phn != null && recruitment.phn.length > 0){
      var tag_a = '<a href="tel:phone">phone [<span class="call">拨打</span>]</a><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
      var phones = recruitment.phn.split(",");
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

    if (recruitment.eml != null && recruitment.eml.length > 0){
      var tag_a = '<a href="mailto:email">email</a><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
      var emails = recruitment.eml.split(",");
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

    if (recruitment.web != null && recruitment.web.length > 0){
      var url = recruitment.web;
      if (recruitment.web.indexOf("://") < 0){
        url = "http://" + url;
      }
      $("#web-div").show().html('<a href="' + url + '">' + recruitment.web + '</a>');
    }
    else{
      $("#web-div").hide().html("");
    }

    if (recruitment.add != null && recruitment.add.length > 0){
      $("#address-div").show().html("地址：<span>" + recruitment.add + "</span>");
    }
    else{
      $("#address-div").hide().html("");
    }

    if (recruitment.o != null && recruitment.o.length > 0){
      $("#overview").html(recruitment.o);
      $("#overview-block").show();
    }
    else{
      $("#overview-block").hide();
      $("#overview").html("");
    }

    if (recruitment.b != null && recruitment.b.length > 0){
      $("#benefit").html(recruitment.b);
      $("#benefit-block").show();
    }
    else{
      $("#benefit-block").hide();
      $("#benefit").html("");
    }

    if (recruitment.pr != null && recruitment.pr.length > 0){
      $("#process").html(recruitment.pr);
      $("#process-block").show();
    }
    else{
      $("#process-block").hide();
      $("#process").html("");
    }

    // display jobs
    $("#jobs .job-list").html("");
    if (recruitment.j != null && recruitment.j.length > 0){
      $("#jobs-block").show();
      display_jobs(recruitment.j);
    }
    else{
      $("#jobs-block").hide();
    }
  }

  function get_recruitment(recruitment){
    // get university recruitment
    var url = home + 'php/get_university_recruitment.php';
    var params = new Object();
    params.i = recruitment.i;

    $.post(url, params, 
      function(d) {
        if (d.result != null && d.result == 0){
          alert(hashMap.Get(String(d.error)));
        }
        else {
          var rs = merge_recruitment(d, recruitment);
          display_recruitment(rs);
          if (tab_detail_disabled){
            $('#tab-detail').bind('click', tabHandler);
            $('#tab-detail').bind('click', function(){window.scrollTo(0, 0);});
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

  $('#more').click(function(){
    $(this).hide();
    $(".list").append(html_searching);
    var openid = $("#openid").val();
    get_recruitments(openid);
  });

  function display_jobs(jobs){
    var li = $("<li />").addClass("list-item");
    var div_row = $("<div />");
    var div_row_fc = div_row.clone().addClass("fc");
    var div_title = div_row.clone().addClass("list-title fb job-title");
    var div_edu = div_row.clone().addClass("fl fb w85");
    var div_number = div_row.clone().addClass("fr fb");
    var div_major = div_row.clone().addClass("fb job-major");
    var div_place = div_row.clone().addClass("fb job-place");
    var div_salary = div_row.clone().addClass("fb salary job-salary");
    var div_content = div_row.clone().addClass("job-content hd");
    for (var i = 0; i < jobs.length; i++){
      var job = jobs[i];
      var row = li.clone().attr("id", "j_"+job.i).attr("data-i", String(job.i))
        .append(div_row.clone().append(div_title.clone().append(job.t)));
      if (job.tt != null){
        row = row.append(div_row_fc.clone().append(div_edu.clone().append(job.e)).append(div_number.clone().append(job.tt+"人")));
      }
      if (job.m != null){
        row = row.append(div_row_fc.clone().append(div_major.clone().append(job.m)));
      }
      if (job.p != null){
        row = row.append(div_row_fc.clone().append(div_place.clone().append(job.p)));
      }
      if (job.s != null){
        row = row.append(div_row_fc.clone().append(div_salary.clone().append(job.s)));
      }
      if (job.c != null){
        row = row.append(div_row_fc.clone().append(div_content.clone().append(job.c.replace("\r\n","<br/>").replace("\n","<br/>").replace("\r","<br/>"))));
      }
      row = row.append(div_row_fc.clone());

      $("#jobs .job-list").append(row);
    }

    $("#jobs .list-item").click(function(event){
      if ($(this).find(".job-title").hasClass("fb")){
        $(this).find(".job-title").removeClass("fb");
      }
      else{
        $(this).find(".job-title").addClass("fb");
      }
      if ($(this).find(".job-major").hasClass("fb")){
        $(this).find(".job-major").removeClass("fb");
      }
      else{
        $(this).find(".job-major").addClass("fb");
      }
      if ($(this).find(".job-place").hasClass("fb")){
        $(this).find(".job-place").removeClass("fb");
      }
      else{
        $(this).find(".job-place").addClass("fb");
      }
      if ($(this).find(".job-salary").hasClass("fb")){
        $(this).find(".job-salary").removeClass("fb");
      }
      else{
        $(this).find(".job-salary").addClass("fb");
      }
      $(this).find(".job-content").toggle();
    });
  }

});