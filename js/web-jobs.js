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
	      cache: false,
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
	      setSelectOptions(cityCache[provinceid], 'city');
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

    var errPlace = function(error, element) {
        element.parent()
        	.append('<div class="search-label fl">&nbsp;</div>')
        	.append(error); // default function
    }

	$("#search-form").validate({
      errorPlacement: errPlace,
      submitHandler: function(form) {
/*
        $.post(
          Drupal.settings.basePath + 'api/security', 
          {
            name: $('#realName').val(),
            ssn: $('#idNo').val(),
            type: 1,
          },
          function(d) {
            var setIdBtn = $('#subSetIdBt');
            if (d.result==1) {
              
            } else {
            }
          }, 
          "json"
        )
        .fail(function( jqxhr, textStatus, error ) {
          var err = textStatus + ", " + error;
          alert( "加载基本信息出现问题，请重新刷新页面" );
          $('#subSetIdBt').prop('enabled', true);
        });*/
      },
      rules: { 
        keyword: { 
          	minlength: 2, 
        }, 
        salary: { 
        	number: true,
        	min: 500, 
        	max: 999999, 
        }, 
        'cmp-size-low': { 
        	number: true,
        	minlength: 2, 
        	min: 10, 
        } 
      }, 
      messages: { 
        keyword: { 
          	minlength: "no less than 2", 
        }, 
        salary: { 
        	number: 'must be a number',
        	min: "No less than 500", 
        	max: "No more than 999999", 
        }, 
        'cmp-size-low': { 
        	number: 'must be a number',
	        minlength: "请输入完整的真实姓名", 
	        min: "No less than 10", 
        } 
      },
    });

});




