$(document).ready(function(){
	var js_path = "http://localhost/js/";

	/// assing options to a select input
	///
	///  json   - the json string
	///  target - id of the select input 
	///  value  - the default value
	function setSelections(json, target, value){
	  var len = json.length;
    var target = $('#' + target);
	  if (len == 0){
	  	target.hide();
	  } else {
		  target.show();
	  }
	  target.empty();//.append('<option value="-1">-</option>');
    var option = $('<option/>');
	  for(var j = 0; j < len; j++) {
	      var op = option.clone();
	      op.attr('value', json[j].id); // fixed typo 
	      if (value != undefined && value == json[j].id){
	        op.attr('selected', 'selected');
	      }
	      op.append(json[j].name);
	      target.append(op);
	  }
	}

	setSelections(provinces, 'province', 10000);

	$.cachedScript = function( url, options ) {
	    // Allow user to set any option except for dataType, cache, and url
	    options = $.extend( options || {}, {
	      dataType: "script",
	      cache: true,
	      url: url,
	      async: false,
	    });
	    return $.ajax( options );
	};

	var cityCache = {}; 
	// cache the city lists so it won't send another request 

	$('#province').change(function(event) {
	var provinceid = $("#province option:selected").val();
	if (provinceid){
	    if (cityCache.hasOwnProperty(provinceid)){
	      setSelections(cityCache[provinceid], 'city');
	    } else {
	      setCities(provinceid);
	    }
	  }
	});

  /// assing options to the 'city' select input
  ///
  ///  provinceid - the id of the province
  ///  value      - the default city value
  function setCities(provinceid, value, async) { 
    if (provinceid == null){
      return;
    }
    if (provinceid == 10000){
  		// no cities if all country has been selected
  	  setSelections([], 'city');
      return;
    }

    if (async == undefined) { async = true; } 
    var url = js_path + '/city/cities_' + provinceid + '.js'; 
    $.cachedScript(url, {async:async}).done(function(data, textStatus) { 
      var cities = eval('cities_' + provinceid);
      cityCache[provinceid] = cities;
      setSelections(cities, 'city');
    });
  }

  // rule to make sure that at least one checkbox is checked
	$.validator.addMethod("keywordtype", function(value, elem, param) {
	    return $(".work-group:checkbox:checked").length > 0;
	},"You must select at least one!");


  /// get the keyword type, 0 for job, 1 for company, 2 for both
  function getKeywordType(){
    var count = $(".work-group:checkbox:checked").length;
    if (count == 1){
      if($("#keyword-job").is(':checked')){
        // job title type
        return 1;
      } else {
        // company name type
        return 0;
      }
    }
    // both checked
    return 2;
  }

  /// get the option values as string concatenated by comma 
  /// 
  /// type: class name of the feature
  function getFeatures(type) { 
    var list = ''; 
    $(".features ." + type + ":checked").each(function(){
        list += $(this).val() + ',';
    }); 
    if (list.length > 1) {
      list = list.substring(0, list.length - 1);
    }
    return list;
  }

  /// get the workplace according to the country, province and city
  function getWorkPlace(){
    var city = $("#city option:selected").val();
    if (city == undefined) { city=''; }
    if (city.length > 0){
      return '1' + city + '00000000000';
    } else {
      var province = $("#province option:selected").val();
      if (province.length == 5){
        return '1000000000000000';
      } else {
        return '1' + province + '00000000000';
      }
    }
  }

  /// get the value of the selected option
  function getSelected(select){
    return $("#" + select + " option:selected").val();
  }

  var searchJob = function(form){ 
    // _jqjsp({"t":4,"c":[{"id":8411537,"ty":4,"nd":[1003027004000,1007001002000,1007002000000,1007003000000],"lc":1371000000000000,"sz":[101,300],"nm":"建峰建设集团股份有限公司威海分公司招聘"},{"id":24380,"ty":6,"nd":[1009002000000,1016000000000,1018000000000,1018001001000,1018001002000,1018003000000],"lc":1430100000000000,"sz":[500,500],"nm":"长沙市芙蓉区蝴蝶树形象摄影店"},{"id":11421,"ty":3,"nd":[1010000000000,1010003000000,1015000000000],"lc":1430111000000000,"sz":[1000,5000],"nm":"中国平安人寿保险股份有限公司湖南分公司"},{"id":69176,"ty":6,"nd":[1005000000000,1010002000000,1011000000000,1012002003004,1015000000000],"lc":1430102000000000,"sz":[10000,null],"nm":"长沙世联兴业房地产顾问有限公司"}],"q":106056,"j":[{"xpr":0,"lct":[1430100000000000],"slr":[4000,6000],"jid":87433810,"edu":1,"wrk":[2,3],"src":[{"sid":24,"url":"http:\/\/baoding.myjob.com\/job\/6b28ae843d19ec53b4a109a6j.html"}],"ttl":"400? '400px': 'auto' );line-height:40px;\" target=\"_blank\" title=\"急聘网上【淘】【宝】天猫淘宝商城刷单工作\/工资一单一结学生上班人士无业人士津可报名招暑假工\" href=\"\/job\/fb1fae84ead302540f6886d7j.html\">急聘网上【淘】【宝】天猫淘宝商城刷单工作\/工资一单一结学生上班人士无业人士津可报名招暑假工","cid":8411537,"brf":"若有意此工作请联系腾 讯号【576 321 907】咨询 需要的条件：（注意：加盟本团队我们绝不收取费用） 承诺：不收取任何费用，不需要软件就可以操作！ （支付宝.网银等即时结算！） 《本公司所有 ...","bnf":[2],"rfr":"2014-09-01"},{"xpr":0,"lct":[1430103000000000],"slr":[3000,3500],"jid":85525012,"wrk":[1,2],"src":[{"sid":5,"url":"http:\/\/www.hnrcsc.com\/jobs\/posFiles\/showPosDetail.asp?tp=1&posid=528843"}],"ttl":"歌玛销售顾问","cid":24380,"brf":"歌玛摄影门店大型面试火热招募中~ 多岗位招聘（门市，摄影助理，化妆助理，摄影师，化妆师，选片师等），届时公司各部门主管都会担任面试官（可接收兼职和应届毕业生） 欢迎有识之士前来 详情电话咨询 可招 ...","bnf":[1,2,5],"rfr":"2014-09-03"},{"lct":[1430111000000000],"slr":[1000,null],"lng":[1001],"jid":26618386,"wrk":[2],"src":[{"sid":1,"url":"http:\/\/search.51job.com\/job\/51548381,c.html"}],"ttl":"兼职电销","cid":11421,"brf":"职位标签: 电话销售 职位职能: 电话销售 职位描述: 职位职能: 销售代表、电话销售TSR 职位描述: *不用风吹日晒，享有舒适的办公环境 *白领的工作环境，金领的收入； *拥有固定的工作时间， ...","bnf":[1,2],"rfr":"2014-09-02"},{"lct":[1430105000000000],"jid":21120317,"wrk":[1,2],"src":[{"sid":5,"url":"http:\/\/www.hnrcsc.com\/jobs\/posFiles\/showPosDetail.asp?tp=1&posid=245527"}],"ttl":"销售助理","cid":69176,"brf":"1、外场诚意客户拓展 2、为客户上门看房提供清晰指引 3、其他项目宣传工作","bnf":[1,2],"rfr":"2014-09-03"}]})
    var base = 'http://www.boryi.com:8080/SearchJobs/jobs?';
    var targetUrl = base 
                + 's1='  + getWorkPlace()                       // 工作地点
                + '&s2=' + getSelected('refresh')               // 刷新日期
                + '&s3=' + getKeywordType()                     // 关键字类型
                + '&s4=' + $("#keyword").val()                  // 关键字
                + '&s7=' + getSelected('job-type')              // 工作类型
                + '&s8=' + $('#salary').val()                   // 期望薪水
                + '&s9=' + getFeatures('benefits')              // 福利待遇
                + '&f1=' + getSelected('gender')                // 性别
                + '&f2=' + $('#age').val()                      // 年龄
                + '&f3=' + $('#height').val()                   // 身高
                + '&f4=' + getSelected('education')             // 教育程度
                + '&f5=' + getFeatures('requirements')          // 补充条件
                + '&f6=' + $("#experience").val();              // 工作经验

    $.ajax({
        url: targetUrl,
        dataType: "jsonp", 
        jsonpCallback: "jcb", 
    }).done(function(d) {
        if (d.t == 0){
          alert('没有找到符合条件的结果，请修改查询条件重试');          
        } else {
          // display results in the 2nd tab
          
        }
    }).fail(function( err ) {
        alert('sorry' + err);
    });
  };

  /// custom how error label displayed
  var errPlace = function(error, element) {
      element.parent().append(error);
  }

	$("#search-form").validate({
      errorPlacement: errPlace,
      submitHandler: searchJob,
      rules: { 
        keyword: { 
          	maxlength: 40, 
        }, 
        salary: { 
        	number: true,
        	min: 500, 
        	max: 999999, 
        }, 
        experience: {
        	number: true,
        	min:0,
        	max:60,
        },
        age: {
        	number: true,
        	min:16,
        	max:80,
        },
        height: {
        	number: true,
        	min:70,
        	max:250,
        },
        'cmp-size-low': { 
        	number: true,
        	min: 10, 
        }, 
        'cmp-size-high': { 
        	number: true,
        	min: 10, 
        }, 
        'keyword-job': {
			keywordtype: true,
	    },
        'keyword-cmp': {
			keywordtype: true,
	    },
      }, 
      messages: { 
        keyword: { 
          	maxlength: "关键字不能超过40个字符", 
        }, 
        salary: { 
        	number: '请输入数字',
        	min: "月薪不能小于500元", 
        	max: "月薪不能大于999999元", 
        }, 
        experience: {
    		number: '请输入数字',
        	min: "工作经验不能小于0年", 
        	max: "工作经验不能大于60年", 
        },
        age: {
    		number: '请输入数字',
        	min: "年龄不能小于16", 
        	max: "年龄不能大于80", 
        },
        height: {
    		number: '请输入数字',
        	min: "身高不能低于70cm", 
        	max: "身高不能超过250cm", 
        },
        'cmp-size-low': { 
        	number: '请输入数字',
	        min: "公司规模不能少于10人", 
        },
        'cmp-size-high': { 
        	number: '请输入数字',
	        min: "公司规模不能少于10人", 
        },
        'keyword-job': {
			     keywordtype: '职位名公司名至少选择一个',
        },
        'keyword-cmp': {
			     keywordtype: '职位名公司名至少选择一个',
        },
      },
    });
});




