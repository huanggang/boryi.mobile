$(document).ready(function(){
  	$('form').quickWizard({
      'breadCrumb': false,
    });

    var baseurl = document.URL;
    var home = baseurl.substring(0, baseurl.lastIndexOf('/')) + "/";
    init();

    var university_name;
    function init() {
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
          else if (pairs[0] == "u"){
            university_name = decodeURI(pairs[1]);
            state++;
          }
        }
      }

      document.title = '伯益网--' + university_name;
      $('#banner').html(university_name +'--毕业生调查问卷');

      if (state < 3){
        if (confirm("请先关注伯益网微信公众号：boryi_com，并通过伯益网微信公众号访问此页面。")){
          window.location.href = home;
        }
        else{
          window.location.href = home + "not_found.htm"
        }
      }
    }
    
    var base = "http://m.boryi.com/php/wx/action.php?questionary=1";
    var postInfo = function(form){ 
      var targetUrl = base;
      var info = {
            company: $('#company').val(),
            address: $('#address').val(),
            phone: $('#phone').val(),
            job_title: $('#job_title').val(),
            salary: $('#salary').val(),
            qq: $('#qq').val(),
            mobile: $('#mobile').val(),
            email: $('#email').val(),
            cnt_name: $('#cnt_name').val(),
            cnt_qq: $('#cnt_qq').val(),
            cnt_mobile: $('#cnt_mobile').val(),
            cnt_name1: $('#cnt_name1').val(),
            cnt_qq1: $('#cnt_qq1').val(),
            cnt_mobile1: $('#cnt_mobile1').val(),
            openid: $("#openid").val(),
            key: $("#key").val(),
      }

      $.ajax({
          url: targetUrl,
          type: 'POST',
          data: JSON.stringify(info),
          contentType: 'application/json',
          processData:false
      }).done(function(d) {
          alert('感谢您的参与!');
          //window.location.href = home;
      }).fail(function(xhr, status, msg) {
          alert('网络不太给力，请重试');
      });
    };

    var is_required = true;
    // the form validator
    var validator = $("form").validate({
      errorPlacement: function(error, element) {
        element.parent().append(error); // default function
      }, 
      submitHandler: postInfo,
      rules: { 
        company: { 
          required: is_required,
        },
        address: { 
          required: is_required,
        },
        job_title: { 
          required: is_required,
        },
        salary: { 
          required: is_required,
        },
      }, 
      messages: { 
        company: { 
          required: "就业单位名称不能为空",
        },
        address: { 
          required: "就业单位地址不能为空",
        },
        job_title: { 
          required: "工作岗位/职务不能为空",
        },
        salary: { 
          required: "工资不能为空",
        },
      },
    });
});