// http://m.boryi.com/post-nearby-job.htm#oi=9032g19pvbh19g&k=02349
$(document).ready(function(){

  init();
  var home = "http://m.boryi.com/";

  function init() {
    var dtoday = new Date();
    dtoday.setHours(0,0,0,0);
    var time = dtoday.getTime() + 15 * 24 * 3600 * 1000;
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
        else if (pairs[0] == "k"){
          $("#key").val(pairs[1]);
          state++;
        }
      }
    }
    if (state < 2){
      window.location.href = home;
    }
  }

  $.validator.addMethod("enddate", function(value, elem, param) {
    var aday = 24 * 3600 * 1000;
    var dtoday = new Date();
    dtoday.setHours(0,0,0,0);
    var dend = new Date($("#end").val());
    var time = dend.getTime() - dtoday.getTime();
    return (time >= (5 * aday) && time <= (30 * aday));
  }, "职位有效期至少5天最多30天");

  $.validator.addMethod("age", function(value, elem, param) {
    var age_low = $("#age-low").val();
    if (age_low == null || age_low.length == 0) {
      return true;
    }
    var age_high = $("#age-high").val();
    if (age_high == null || age_high.length == 0) {
      return true;
    }
    age_low = Number(age_low);
    age_high = Number(age_high);
    return (age_high >= age_low);
  }, "设置年龄区间错误");

  $.validator.addMethod("height", function(value, elem, param) {
    var height_low = $("#height-low").val();
    if (height_low == null || height_low.length == 0) {
      return true;
    }
    var height_high = $("#height-high").val();
    if (height_high == null || height_high.length == 0) {
      return true;
    }
    height_low = Number(height_low);
    height_high = Number(height_high);
    return (height_high >= height_low);
  }, "设置身高区间错误");

  $.validator.addMethod("salary", function(value, elem, param) {
    var salary_low = $("#salary-low").val();
    if (salary_low == null || salary_low.length == 0) {
      return true;
    }
    var salary_high = $("#salary-high").val();
    if (salary_high == null || salary_high.length == 0) {
      return true;
    }
    salary_low = Number(salary_low);
    salary_high = Number(salary_high);
    return (salary_high >= salary_low);
  }, "设置月薪区间错误");

  // the form validator
  var validator = $("#setForm").validate({
    errorPlacement: function(error, element) {
      element.parent().append(error); // default function
    }, 
    rules: { 
      company: {
        required: true,
        rangelength: [2,64],
      },
      title: { 
        required: true,
        rangelength: [2,32],
      },
      end: {
        required: true,
        date: true,
        enddate: true,
      },
      "age-low": {
        digits: true,
        range: [16,80],
        age: true,
      },
      "age-high": {
        digits: true,
        range: [16,80],
        age: true,
      },
      "height-low": {
        digits: true,
        range: [70,250],
        height: true,
      },
      "height-high": {
        digits: true,
        range: [70,250],
        height: true,
      },
      experience: {
        digits: true,
        range: [0,60],
      },
      "salary-low": {
        digits: true,
        range: [500,999999],
        salary: true,
      },
      "salary-high": {
        digits: true,
        range: [500,999999],
        salary: true,
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
      company: {
        required: "请填写公司名",
        rangelength: "公司名至少两个字最长64个字", 
      },
      title: { 
        required: "请填写职位名",
        rangelength: "职位名至少两个字最长32个字", 
      },
      end: {
        required: "请填写截止日期",
        date: "请输入截止日期：年/月/日",
        enddate: "职位有效期至少5天最多30天",
      },
      "age-low": {
        digits: "请输入整数",
        range: "年龄应在16岁至80岁之间",
        age: "设置年龄区间错误",
      },
      "age-high": {
        digits: "请输入整数",
        range: "年龄应在16岁至80岁之间",
        age: "设置年龄区间错误",
      },
      "height-low": {
        digits: "请输入整数",
        range: "身高应在70厘米至250厘米之间",
        height: "设置身高区间错误",
      },
      "height-high": {
        digits: "请输入整数",
        range: "身高应在70厘米至250厘米之间",
        height: "设置身高区间错误",
      },
      experience: {
        digits: "请输入整数",
        range: "经验应在0至60年之间",
      },
      "salary-low": {
        digits: "请输入整数",
        range: "月薪应在500元至999,999元之间",
        salary: "设置月薪区间错误",
      },
      "salary-high": {
        digits: "请输入整数",
        range: "月薪应在500元至999,999元之间",
        //salary: "设置月薪区间错误",
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

  $("#description").keyup(function(event){
    $('#description').parent().find(".myerror").remove();
    var div = $('<div/>').addClass('myerror').css("color", "red");
    var description = get_string($("#description").val());
    if (description == null) {
      $('#description').parent().append(div.clone().append("请填写职位描述"));
    }
    else if (description.length > 512) {
      $("#description").val(description.substr(0, 512));
    }
  }).focusout(function(event){
    $('#description').parent().find(".myerror").remove();
    var div = $('<div/>').addClass('myerror').css("color", "red");
    var description = get_string($("#description").val());
    if (description == null) {
      $('#description').parent().append(div.clone().append("请填写职位描述"));
    }
    else if (description.length < 4) {
      $('#description').parent().append(div.clone().append("职位描述至少4个字最长512个字"));
    }
    else if (description.length > 512) {
      $("#description").val(description.substr(0, 512));
    }
  });

  $("#requirement").keyup(function(event){
    var requirement = get_string($("#requirement").val());
    if (requirement != null && requirement.length > 512) {
      $("#requirement").val(requirement.substr(0, 512));
    }
  }).focusout(function(event){
    var requirement = get_string($("#requirement").val());
    if (requirement != null && requirement.length > 512) {
      $("#requirement").val(requirement.substr(0, 512));
    }
  });
  $("#benefit").keyup(function(event){
    var benefit = get_string($("#benefit").val());
    if (benefit != null && benefit.length > 512) {
      $("#benefit").val(benefit.substr(0, 512));
    }
  }).focusout(function(event){
    var benefit = get_string($("#benefit").val());
    if (benefit != null && benefit.length > 512) {
      $("#benefit").val(benefit.substr(0, 512));
    }
  });

  $('#setForm').submit(function(event){
    event.preventDefault();
  });

  $('#postJob').click(function(event){
    var valid = true;
    var div = $('<div/>').addClass('myerror').css("color", "red");

    // check description, requirement, benefit
    $('#description').parent().find(".myerror").remove();
    var description = get_string($("#description").val());
    if (description == null){
      valid = false;
      $('#description').parent().append(div.clone().append("请填写职位描述"));
    }
    else if (description.length < 4 || description > 512) {
      valid = false;
      $('#description').parent().append(div.clone().append("职位描述至少4个字最长512个字"));
    }
    var requirement = get_string($("#requirement").val());
    if (requirement != null && requirement.length > 512) {
      $("#requirement").val(requirement.substr(0, 512));
    }
    var benefit = get_string($("#benefit").val());
    if (benefit != null && benefit.length > 512) {
      $("#benefit").val(benefit.substr(0, 512));
    }
    // check phone, email, address
    $('#address').parent().find(".myerror").remove();
    var phone = get_string($("#phone").val());
    var email = get_string($("#email").val());
    var address = get_string($("#address").val());
    if (phone == null && email == null && address == null) {
      valid = false;
      $('#address').parent().append(div.clone().append("请填写至少一种联系方式"));
    }

    if(validator.form() && valid){
      var openid = get_string($("#openid").val());
      var key = get_string($("#key").val());
      var company = get_string($("#company").val());
      var title = get_string($("#title").val());
      var end = get_string($("#end").val());
      var sex = Number($(".gender:checked").val());
      var age_low = get_number($("#age-low").val());
      var age_high = get_number($("#age-high").val());
      var height_low = get_number($("#height-low").val());
      var height_high = get_number($("#height-high").val());
      var education = Number($('#education option:selected').val());
      var experience = get_number($("#experience").val());
      var salary_low = get_number($("#salary-low").val());
      var salary_high = get_number($("#salary-high").val());
      var social_security = $("#social-security:checked").val() != null ? 1 : null;
      var housing_fund = $("#housing-fund:checked").val() != null ? 1 : null;
      var annual_vacations = $("#annual-vacations:checked").val() != null ? 1 : null;
      var housing = $("#housing:checked").val() != null ? 1 : null;
      var meals = $("#meals:checked").val() != null ? 1 : null;
      var no_travel = $("#no-travel:checked").val() != null ? 1 : null;
      var no_overtime = $("#no-overtime:checked").val() != null ? 1 : null;
      var no_nightshift = $("#no-nightshift:checked").val() != null ? 1 : null;

      if (sex == -1) sex = null;
      if (education == 0) education = null;

      var baseurl = document.URL;
      var url = baseurl.substring(0, baseurl.lastIndexOf('/')) + '/php/post_nearby_job.php';
      var params = new Object();
      params.oi = openid;
      params.k = key;
      params.e = end;
      params.t = title;
      if (sex != null) params.sx = sex;
      if (age_low != null) params.al = age_low;
      if (age_high != null) params.ah = age_high;
      if (height_low != null) params.hl = height_low;
      if (height_high != null) params.hh = height_high;
      if (education > 0) params.edu = education;
      if (experience != null) params.exp = experience;
      if (salary_low != null) params.sl = salary_low;
      if (salary_high != null) params.sh = salary_high;
      if (social_security != null) params.ss = social_security;
      if (housing_fund != null) params.hf = housing_fund;
      if (annual_vacations != null) params.av = annual_vacations;
      if (housing != null) params.hs = housing;
      if (meals != null) params.ml = meals;
      if (no_travel != null) params.tr = no_travel;
      if (no_overtime != null) params.ot = no_overtime;
      if (no_nightshift != null) params.ns = no_nightshift;
      if (requirement != null) params.rqr = requirement;
      params.dsc = description;
      if (benefit != null) params.bnf = benefit;
      params.c = company;
      if (phone != null) params.phn = phone;
      if (email != null) params.eml = email;
      if (address != null) params.add = address;

      $.post(url, params, 
        function(d) {
          if (d.result){
            window.location.href = home + "nearby-jobs.htm#oi=" + openid + "&k=" + key;
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
      if (value == NaN){
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