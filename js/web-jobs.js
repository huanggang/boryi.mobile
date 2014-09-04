$(document).ready(function(){
	var js_path = "http://localhost/js/";

	/// assing options to a select input
	///
	///  json   - the json string
	///  target - id of the select input 
	///  value  - the default value
	function setSelections(json, target, value){
	  var len = json.length;
	  if (len == 0){
	  	$('#' + target).hide();
	  } else {
		$('#' + target).show();
	  }
	  $('#' + target).empty();//.append('<option value="-1">-</option>');
	  for(var j = 0; j < len; j++) {
	      var op = $('<option/>');
	      op.attr('value', json[j].id); // fixed typo 
	      if (value != undefined && value == json[j].id){
	        op.attr('selected', 'selected');
	      }
	      op.append(json[j].name);
	      $('#' + target).append(op);
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
	    if($(".work-group:checkbox:checked").length > 0){
	       return true;
	   }else {
	       return false;
	   }
	},"You must select at least one!");


    var errPlace = function(error, element) {
        element.parent().append(error);
    }

	$("#search-form").validate({
      errorPlacement: errPlace,
      submitHandler: function(form) {
      },
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




