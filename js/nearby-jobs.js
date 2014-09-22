$(document).ready(function(){

  $('.ui-tab-item').click(tabHandler);

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
    var key = null;
    var state = 0;
    var hash = window.location.hash;
    if (hash.length > 1){
      hash = hash.slice(1);
      var params = hash.split("&");
      for (var i = 0; i < params.length; i++){
        var pairs = params[i].split("=");
        if (pairs[0] === "oi") {
          openid = pairs[1];
          $("#openid").val(openid);
          state++;
        }
        else if (pairs[0] == "k"){
          key = pairs[1];
          $("#key").val(key);
          state++;
        }
      }
    }
    if (state < 2){
      if (confirm("请先关注伯益网微信公众号：boryi_com，并通过伯益网微信公众号访问此页面。")){
        window.location.href = home;
      }
      else{
        window.location.href = home + "not_found.htm"
      }
    }
    else{
      $(".list").append(html_searching);
      get_jobs(openid, key);
    }
  }

  function get_ids(){
    var obj = new Object();
    var hash = new Array();
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
      var div_job = div_row.clone().addClass("list-title fb");
      var div_company = div_row.clone().addClass("fl fb w80");
      var div_distance = div_row.clone().addClass("fr");
      var div_salary = div_row.clone().addClass("fl");
      var div_requirement = div_row.clone().addClass("fl fb w45");
      var div_date = div_distance.clone();
      for (var i = 0; i < rjobs.length; i++){
        var rjob = rjobs[i];
        var row = li.clone().attr("data-i", rjob.i).attr("data-lat", rjob.lat).attr("data-lng", rjob.lng).attr("data-d", rjob.d).attr("data-s", rjob.s).attr("data-t", rjob.t).attr("data-sx", rjob.sx).attr("data-al", rjob.al).attr("data-ah", rjob.ah).attr("data-hl", rjob.hl).attr("data-hh", rjob.hh).attr("data-edu", rjob.edu).attr("data-exp", rjob.exp).attr("data-sl", rjob.sl).attr("data-sh", rjob.sh).attr("data-c", rjob.c);
        row = row
          .append(div_row.clone().append(div_job.clone().append(rjob.t)))
          .append(div_row_fc.clone().append(div_company.clone().append(rjob.c)).append(div_distance.clone().append(String(Math.round(rjob.d * 100)*10) + "米")));
        var salary = "";
        if (rjobs.sl != null && rjobs.sh != null && rjobs.sl > 0 && rjobs.sh > 0){
          salary = String(rjobs.sl) + "~" + String(rjobs.sh) + "元";
        }
        else if (rjobs.sl != null && rjobs.sl > 0){
          salary = String(rjobs.sl) + "元以上";
        }
        else if (rjobs.sh != null && rjobs.sh > 0){
          salary = String(rjobs.sh) + "元以下";
        }
        var requirement = "";
        if (rjobs.edu != null && rjobs.edu > 0){
          requirement += "&middot;" + ;
        }
        if (rjobs.exp != null && rjobs.exp > 0){
          requirement += "&middot;" + String(rjobs.exp) + "年以上经验";
        }
        if (rjobs.sx != null){
          if (rjobs.sx == 0){
            requirement += "&middot;" + "女";
          }
          else {
            requirement += "&middot;" + "男";
          }
        }
        if (rjobs.al != null && rjobs.ah != null && rjobs.al > 0 && rjobs.ah > 0){
          requirement += "&middot;" + String(rjobs.al) + "~" + String(rjobs.ah) + "岁";
        }
        else if (rjobs.al != null && rjobs.al > 0){
          requirement += "&middot;" + String(rjobs.al) + "岁以上";
        }
        else if (rjobs.ah != null && rjobs.ah > 0){
          requirement += "&middot;" + String(rjobs.ah) + "岁以下";
        }
        if (rjobs.hl != null && rjobs.hh != null && rjobs.hl > 0 && rjobs.hh > 0){
          requirement += "&middot;" + String(rjobs.hl) + "~" + String(rjobs.hh) + "公分";
        }
        else if (rjobs.hl != null && rjobs.hl > 0){
          requirement += "&middot;" + String(rjobs.hl) + "公分以上";
        }
        else if (rjobs.hh != null && rjobs.hh > 0){
          requirement += "&middot;" + String(rjobs.hh) + "公分以下";
        }

        $(".list").append(row);
      }

      if (page.i * page.n < page.t){
        $("#more").show();
      }
    }
  }

  function get_jobs(openid, key){
    // get nearby jobs
    var url = home + 'php/get_nearby_jobs.php';
    var params = new Object();
    params.oi = openid;
    params.k = key;
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
      var key = $("#key").val();
      var id = $("#complaint-job-id").val();

      var url = home + 'php/complaint_job.php';
      var params = new Object();
      params.oi = openid;
      params.k = key;
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
    var openid = $("#openid").val();
    var key = $("#key").val();
    get_jobs(openid, key);
    $(this).hide();
    $(".list").append(html_searching);
  });

});