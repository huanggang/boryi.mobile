$(document).ready(function(){
	var js_path = "http://localhost/bm/js/";

	$.cachedScript = function( url, options ) {
    // Allow user to set any option except for dataType, cache, and url
    options = $.extend( options || {}, {
      dataType: "script",
      cache: true,
      url: url,
      async: false,
    });
    return $.ajax(options);
	};

	var cityCache = {}; 
	// cache the city lists so it won't send another request 

  setSelections(provinces, 'province', 10000);
	
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
  var page = []; // the page option

  var base = 'http://www.boryi.com:8080/SearchJobs/jobs?';

  var searchJob = function(form){ 
    // _jqjsp({"t":4,"c":[{"id":8411537,"ty":4,"nd":[1003027004000,1007001002000,1007002000000,1007003000000],"lc":1371000000000000,"sz":[101,300],"nm":"Ã¥Â»ÂºÃ¥Â³Â°Ã¥Â»ÂºÃ¨Â®Â¾Ã©â€ºâ€ Ã¥â€ºÂ¢Ã¨â€šÂ¡Ã¤Â»Â½Ã¦Å“â€°Ã©â„¢ÂÃ¥â€¦Â¬Ã¥ÂÂ¸Ã¥Â¨ÂÃ¦ÂµÂ·Ã¥Ë†â€ Ã¥â€¦Â¬Ã¥ÂÂ¸Ã¦â€¹â€ºÃ¨Â?},{"id":24380,"ty":6,"nd":[1009002000000,1016000000000,1018000000000,1018001001000,1018001002000,1018003000000],"lc":1430100000000000,"sz":[500,500],"nm":"Ã©â€¢Â¿Ã¦Â²â„¢Ã¥Â¸â€šÃ¨Å â„¢Ã¨â€œâ€°Ã¥Å’ÂºÃ¨ÂÂ´Ã¨ÂÂ¶Ã¦Â â€˜Ã¥Â½Â¢Ã¨Â±Â¡Ã¦â€˜â€žÃ¥Â½Â±Ã¥Âºâ€?},{"id":11421,"ty":3,"nd":[1010000000000,1010003000000,1015000000000],"lc":1430111000000000,"sz":[1000,5000],"nm":"Ã¤Â¸Â­Ã¥â€ºÂ½Ã¥Â¹Â³Ã¥Â®â€°Ã¤ÂºÂºÃ¥Â¯Â¿Ã¤Â¿ÂÃ©â„¢Â©Ã¨â€šÂ¡Ã¤Â»Â½Ã¦Å“â€°Ã©â„¢ÂÃ¥â€¦Â¬Ã¥ÂÂ¸Ã¦Â¹â€“Ã¥Ââ€”Ã¥Ë†â€ Ã¥â€¦Â¬Ã¥Â?},{"id":69176,"ty":6,"nd":[1005000000000,1010002000000,1011000000000,1012002003004,1015000000000],"lc":1430102000000000,"sz":[10000,null],"nm":"Ã©â€¢Â¿Ã¦Â²â„¢Ã¤Â¸â€“Ã¨Ââ€Ã¥â€¦Â´Ã¤Â¸Å¡Ã¦Ë†Â¿Ã¥Å“Â°Ã¤ÂºÂ§Ã©Â¡Â¾Ã©â€”Â®Ã¦Å“â€°Ã©â„¢ÂÃ¥â€¦Â¬Ã¥Â?}],"q":106056,"j":[{"xpr":0,"lct":[1430100000000000],"slr":[4000,6000],"jid":87433810,"edu":1,"wrk":[2,3],"src":[{"sid":24,"url":"http:\/\/baoding.myjob.com\/job\/6b28ae843d19ec53b4a109a6j.html"}],"ttl":"400? '400px': 'auto' );line-height:40px;\" target=\"_blank\" title=\"Ã¦â‚¬Â¥Ã¨ÂËœÃ§Â½â€˜Ã¤Â¸Å Ã£â‚¬ÂÃ¦Â·ËœÃ£â‚¬â€˜Ã£â‚¬ÂÃ¥Â®ÂÃ£â‚¬â€˜Ã¥Â¤Â©Ã§Å’Â«Ã¦Â·ËœÃ¥Â®ÂÃ¥â€¢â€ Ã¥Å¸Å½Ã¥Ë†Â·Ã¥Ââ€¢Ã¥Â·Â¥Ã¤Â½Å“\/Ã¥Â·Â¥Ã¨Âµâ€žÃ¤Â¸â‚¬Ã¥Ââ€¢Ã¤Â¸â‚¬Ã§Â»â€œÃ¥Â­Â¦Ã§â€Å¸Ã¤Â¸Å Ã§ÂÂ­Ã¤ÂºÂºÃ¥Â£Â«Ã¦â€”Â Ã¤Â¸Å¡Ã¤ÂºÂºÃ¥Â£Â«Ã¦Â´Â¥Ã¥ÂÂ¯Ã¦Å Â¥Ã¥ÂÂÃ¦â€¹â€ºÃ¦Å¡â€˜Ã¥Ââ€¡Ã¥Â·Â¥\" href=\"\/job\/fb1fae84ead302540f6886d7j.html\">Ã¦â‚¬Â¥Ã¨ÂËœÃ§Â½â€˜Ã¤Â¸Å Ã£â‚¬ÂÃ¦Â·ËœÃ£â‚¬â€˜Ã£â‚¬ÂÃ¥Â®ÂÃ£â‚¬â€˜Ã¥Â¤Â©Ã§Å’Â«Ã¦Â·ËœÃ¥Â®ÂÃ¥â€¢â€ Ã¥Å¸Å½Ã¥Ë†Â·Ã¥Ââ€¢Ã¥Â·Â¥Ã¤Â½Å“\/Ã¥Â·Â¥Ã¨Âµâ€žÃ¤Â¸â‚¬Ã¥Ââ€¢Ã¤Â¸â‚¬Ã§Â»â€œÃ¥Â­Â¦Ã§â€Å¸Ã¤Â¸Å Ã§ÂÂ­Ã¤ÂºÂºÃ¥Â£Â«Ã¦â€”Â Ã¤Â¸Å¡Ã¤ÂºÂºÃ¥Â£Â«Ã¦Â´Â¥Ã¥ÂÂ¯Ã¦Å Â¥Ã¥ÂÂÃ¦â€¹â€ºÃ¦Å¡â€˜Ã¥Ââ€¡Ã¥Â?,"cid":8411537,"brf":"Ã¨â€¹Â¥Ã¦Å“â€°Ã¦â€žÂÃ¦Â­Â¤Ã¥Â·Â¥Ã¤Â½Å“Ã¨Â¯Â·Ã¨Ââ€Ã§Â³Â»Ã¨â€¦Â?Ã¨Â®Â¯Ã¥ÂÂ·Ã£â‚?76 321 907Ã£â‚¬â€˜Ã¥â€™Â¨Ã¨Â?Ã©Å“â‚¬Ã¨Â¦ÂÃ§Å¡â€žÃ¦ÂÂ¡Ã¤Â»Â¶Ã¯Â¼Å¡Ã¯Â¼Ë†Ã¦Â³Â¨Ã¦â€žÂÃ¯Â¼Å¡Ã¥Å Â Ã§â€ºÅ¸Ã¦Å“Â¬Ã¥â€ºÂ¢Ã©ËœÅ¸Ã¦Ë†â€˜Ã¤Â»Â¬Ã§Â»ÂÃ¤Â¸ÂÃ¦â€Â¶Ã¥Ââ€“Ã¨Â´Â¹Ã§â€Â¨Ã¯Â?Ã¦â€°Â¿Ã¨Â¯ÂºÃ¯Â¼Å¡Ã¤Â¸ÂÃ¦â€Â¶Ã¥Ââ€“Ã¤Â»Â»Ã¤Â½â€¢Ã¨Â´Â¹Ã§â€Â¨Ã¯Â¼Å’Ã¤Â¸ÂÃ©Å“â‚¬Ã¨Â¦ÂÃ¨Â½Â¯Ã¤Â»Â¶Ã¥Â°Â±Ã¥ÂÂ¯Ã¤Â»Â¥Ã¦â€œÂÃ¤Â½Å“Ã¯Â?Ã¯Â¼Ë†Ã¦â€Â¯Ã¤Â»ËœÃ¥Â®Â?Ã§Â½â€˜Ã©â€œÂ¶Ã§Â­â€°Ã¥ÂÂ³Ã¦â€”Â¶Ã§Â»â€œÃ§Â®â€”Ã¯Â¼ÂÃ¯Â?Ã£â‚¬Å Ã¦Å“Â¬Ã¥â€¦Â¬Ã¥ÂÂ¸Ã¦â€°â‚¬Ã¦Å“?...","bnf":[2],"rfr":"2014-09-01"},{"xpr":0,"lct":[1430103000000000],"slr":[3000,3500],"jid":85525012,"wrk":[1,2],"src":[{"sid":5,"url":"http:\/\/www.hnrcsc.com\/jobs\/posFiles\/showPosDetail.asp?tp=1&posid=528843"}],"ttl":"Ã¦Â­Å’Ã§Å½â€ºÃ©â€â‚¬Ã¥â€Â®Ã©Â¡Â¾Ã©â€?,"cid":24380,"brf":"Ã¦Â­Å’Ã§Å½â€ºÃ¦â€˜â€žÃ¥Â½Â±Ã©â€”Â¨Ã¥Âºâ€”Ã¥Â¤Â§Ã¥Å¾â€¹Ã©ÂÂ¢Ã¨Â¯â€¢Ã§ÂÂ«Ã§Æ’Â­Ã¦â€¹â€ºÃ¥â€¹Å¸Ã¤Â¸Â­~ Ã¥Â¤Å¡Ã¥Â²â€”Ã¤Â½ÂÃ¦â€¹â€ºÃ¨ÂËœÃ¯Â¼Ë†Ã©â€”Â¨Ã¥Â¸â€šÃ¯Â¼Å’Ã¦â€˜â€žÃ¥Â½Â±Ã¥Å Â©Ã§Ââ€ Ã¯Â¼Å’Ã¥Å’â€“Ã¥Â¦â€ Ã¥Å Â©Ã§Ââ€ Ã¯Â¼Å’Ã¦â€˜â€žÃ¥Â½Â±Ã¥Â¸Ë†Ã¯Â¼Å’Ã¥Å’â€“Ã¥Â¦â€ Ã¥Â¸Ë†Ã¯Â¼Å’Ã©â‚¬â€°Ã§â€°â€¡Ã¥Â¸Ë†Ã§Â­â€°Ã¯Â¼â€°Ã¯Â¼Å’Ã¥Â±Å Ã¦â€”Â¶Ã¥â€¦Â¬Ã¥ÂÂ¸Ã¥Ââ€žÃ©Æ’Â¨Ã©â€”Â¨Ã¤Â¸Â»Ã§Â®Â¡Ã©Æ’Â½Ã¤Â¼Å¡Ã¦â€¹â€¦Ã¤Â»Â»Ã©ÂÂ¢Ã¨Â¯â€¢Ã¥Â®ËœÃ¯Â¼Ë†Ã¥ÂÂ¯Ã¦Å½Â¥Ã¦â€Â¶Ã¥â€¦Â¼Ã¨ÂÅ’Ã¥â€™Å’Ã¥Âºâ€Ã¥Â±Å Ã¦Â¯â€¢Ã¤Â¸Å¡Ã§â€Å¸Ã¯Â?Ã¦Â¬Â¢Ã¨Â¿Å½Ã¦Å“â€°Ã¨Â¯â€ Ã¤Â¹â€¹Ã¥Â£Â«Ã¥â€°ÂÃ¦ÂÂ?Ã¨Â¯Â¦Ã¦Æ’â€¦Ã§â€ÂµÃ¨Â¯ÂÃ¥â€™Â¨Ã¨Â¯Â?Ã¥ÂÂ¯Ã¦â€¹â€?...","bnf":[1,2,5],"rfr":"2014-09-03"},{"lct":[1430111000000000],"slr":[1000,null],"lng":[1001],"jid":26618386,"wrk":[2],"src":[{"sid":1,"url":"http:\/\/search.51job.com\/job\/51548381,c.html"}],"ttl":"Ã¥â€¦Â¼Ã¨ÂÅ’Ã§â€ÂµÃ©â€â‚¬","cid":11421,"brf":"Ã¨ÂÅ’Ã¤Â½ÂÃ¦Â â€¡Ã§Â­Â? Ã§â€ÂµÃ¨Â¯ÂÃ©â€â‚¬Ã¥â€?Ã¨ÂÅ’Ã¤Â½ÂÃ¨ÂÅ’Ã¨Æ’Â½: Ã§â€ÂµÃ¨Â¯ÂÃ©â€â‚¬Ã¥â€?Ã¨ÂÅ’Ã¤Â½ÂÃ¦ÂÂÃ¨Â¿Â°: Ã¨ÂÅ’Ã¤Â½ÂÃ¨ÂÅ’Ã¨Æ’Â½: Ã©â€â‚¬Ã¥â€Â®Ã¤Â»Â£Ã¨Â¡Â¨Ã£â‚¬ÂÃ§â€ÂµÃ¨Â¯ÂÃ©â€â‚¬Ã¥â€Â®TSR Ã¨ÂÅ’Ã¤Â½ÂÃ¦ÂÂÃ¨Â¿Â°: *Ã¤Â¸ÂÃ§â€Â¨Ã©Â£Å½Ã¥ÂÂ¹Ã¦â€”Â¥Ã¦â„¢â€™Ã¯Â¼Å’Ã¤ÂºÂ«Ã¦Å“â€°Ã¨Ë†â€™Ã©â‚¬â€šÃ§Å¡â€žÃ¥Å Å¾Ã¥â€¦Â¬Ã§Å½Â¯Ã¥Â¢Æ?*Ã§â„¢Â½Ã©Â¢â€ Ã§Å¡â€žÃ¥Â·Â¥Ã¤Â½Å“Ã§Å½Â¯Ã¥Â¢Æ’Ã¯Â¼Å’Ã©â€¡â€˜Ã©Â¢â€ Ã§Å¡â€žÃ¦â€Â¶Ã¥â€¦Â¥Ã¯Â¼â€?*Ã¦â€¹Â¥Ã¦Å“â€°Ã¥â€ºÂºÃ¥Â®Å¡Ã§Å¡â€žÃ¥Â·Â¥Ã¤Â½Å“Ã¦â€”Â¶Ã©â€”Â´Ã¯Â¼Å?...","bnf":[1,2],"rfr":"2014-09-02"},{"lct":[1430105000000000],"jid":21120317,"wrk":[1,2],"src":[{"sid":5,"url":"http:\/\/www.hnrcsc.com\/jobs\/posFiles\/showPosDetail.asp?tp=1&posid=245527"}],"ttl":"Ã©â€â‚¬Ã¥â€Â®Ã¥Å Â©Ã§Â?,"cid":69176,"brf":"1Ã£â‚¬ÂÃ¥Â¤â€“Ã¥Å“ÂºÃ¨Â¯Å¡Ã¦â€žÂÃ¥Â®Â¢Ã¦Ë†Â·Ã¦â€¹â€œÃ¥Â?2Ã£â‚¬ÂÃ¤Â¸ÂºÃ¥Â®Â¢Ã¦Ë†Â·Ã¤Â¸Å Ã©â€”Â¨Ã§Å“â€¹Ã¦Ë†Â¿Ã¦ÂÂÃ¤Â¾â€ºÃ¦Â¸â€¦Ã¦â„¢Â°Ã¦Å’â€¡Ã¥Â¼â€?3Ã£â‚¬ÂÃ¥â€¦Â¶Ã¤Â»â€“Ã©Â¡Â¹Ã§â€ºÂ®Ã¥Â®Â£Ã¤Â¼Â Ã¥Â·Â¥Ã¤Â?,"bnf":[1,2],"rfr":"2014-09-03"}]})
    var targetUrl = base;

    targetUrl += 's1='  + getWorkPlace();                       // 工作地点
    targetUrl += '&s2=' + getSelected('refresh');               // 刷新日期

    var keyword = $.trim($("#keyword").val());
    if (keyword.length > 0){
      targetUrl += '&s3=' + getKeywordType();                   // 关键字类型
      targetUrl += '&s4=' + keyword;                            // 关键字
    }

    var jobtype = getSelected('job-type');
    if (jobtype.length > 0){
      targetUrl += '&s7=' + jobtype;                            // 工作类型
    }

    var salary = $('#salary').val();
    if (salary > 0){
      targetUrl += '&s8=' + salary;                             // 期望薪水
    }

    var benefits = getFeatures('benefits');
    if (benefits.length > 0){
      targetUrl += '&s9=' + benefits;                           // 福利待遇
    }

    var cmptype = getSelected('cmp-type');
    if (cmptype.length > 0){
      targetUrl += '&s10=' + cmptype;                            // 公司性质
    }

    var gender = getSelected('gender');
    if (gender > 0){
      targetUrl += '&f1=' + gender;                             // 性别
    }

    var age = $('#age').val();
    if (age > 0){
      targetUrl += '&f2=' + age;                                // 年龄
    }

    var height = $('#height').val();
    if (height > 0){
      targetUrl += '&f3=' + height;                             // 身高
    }

    var education = getSelected('education');
    if (education > 0){
      targetUrl += '&f4=' + education;                          // 教育程度
    }

    var requirements = getFeatures('requirements');
    if (requirements.length > 0){
      targetUrl += '&f5=' + requirements;                       // 补充条件
    }

    var experience = $.trim($("#experience").val());
    if (experience.length > 0){
      targetUrl += '&f6=' + experience;                         // 工作经验
    }

    $.ajax({
        url: targetUrl,
        dataType: "jsonp", 
        jsonpCallback: "jcb", 
        cache: true,
        timeout: 5000, 
    }).done(function(d) {
        if (d.t == 0){
          alert('没有找到符合条件的结果，请修改查询条件重试');          
        } else {
          // clear the list first
          $('ul.list').empty();
          // set global trackers
          page.currentp = 1;  // current tracker mark
          page.currentq = 0;  // current query id mark
          page.total = 0;     // total result mark
          
          // display results in the list tab
          showJobs(d);          
        }
    }).fail(function(xhr, status, msg) {
        alert('网络问题，请重试');
    });
  };

  /// display searching results 
  function showJobs(json){
    $('#tab-list').trigger('click');
    
    if (page.currentq == 0){
      // to get the query id if there exists
      page.currentq = json['q'] || 0;
    } 

    if (page.total == 0){
      // to get the total if there exists
      page.total = json['t'] || 0;
    } 

    alert('total is' + page.total + '; now page:' + page.currentp);

    if ((page.total - 1) / 20 <= page.currentp++){
      $('#more').hide();
    } else {
      $('#more').show();
    }
    

    var companies = json['c'];
    var jobs = json['j'];

    var li = $('<li />').addClass('list-item');
    var fc = $('<div />').addClass('fc');
    var fbc = fc.addClass('fb');
    var fr = $('<div />').addClass('fr');
    var fl = $('<div />').addClass('fl');
    var cmp = $('<div />').addClass('fl fb w75');

    var title_div = $('<div />').addClass('list-title fb');

    for (var i = 0; i <= jobs.length - 1; i++) {
      var job = jobs[i];

      var title = title_div.clone().append(job['ttl']).wrap('<div />');

      var list = li.clone();
      list.append(title);
      list.append(fc.clone()
            .append(cmp.clone().append(
                map_id_name(companies, job['cid']))
            )
            .append(fr.clone().append(job['rfr']))
      );

      list.append(fbc.clone()
            .append(fl.clone().append(showSalary(job['slr'])))
            .append(fr.clone().append('消息来源:' + sources[job['src'][0]['sid']]))
      ).append(fc.clone());
      
      $('ul.list').append(list);
    }
  }

  // load another 20 results if there exists 
  $('#more').click(function(){
    var targetUrl = base + 'q=' + page.currentq + '&p=' + page.currentp;

    $.ajax({
        url: targetUrl,
        dataType: "jsonp", 
        jsonpCallback: "jcb", 
        cache: true,
        timeout: 10000, 
    }).done(function(d) {
        if (d.t == 0){
          alert('没有找到符合条件的结果，请修改查询条件重试');          
        } else {
          // display results in the 2nd tab
          showJobs(d);          
        }
    }).fail(function(xhr, status, msg) {
        alert('网络问题，请重试');
    });
  });

  function showSalary(salary){
    var result = '';
    salary = salary || [];
    if (salary.length == 2){
      if (salary[0] == null && salary[1] > 0){
        result = salary[1] + '以下';
      } else if (salary[0] > 0 && salary[1] == null){
        result = salary[0] + '以上';
      } else if (salary[0] > 0 && salary[1] > 0){
        result = salary[0] + '~' + salary[1];
      } 
    }
    if (result.length > 1){
      result += '元';
    }
    return result;
  }

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