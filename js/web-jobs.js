$(document).ready(function(){
  $("#back").click(function(event){
    if ($('#tab-detail').hasClass("ui-tab-item-current")){
      $('#tab-list').click();
    }
    else if ($('#tab-list').hasClass("ui-tab-item-current")){
      $('#tab-search').click();
    }
    else if ($('#tab-search').hasClass("ui-tab-item-current")){
      $('#tab-list').click();
    }
  });
  
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
	// cache the city lists so it won't send repeted request 

  setSelections(provinces, 'province', 10000);
	
  $('#province').change(function(event) {
	var provinceid = $("#province option:selected").val();
	if (provinceid){
	    if (cityCache.hasOwnProperty(provinceid)){
	      setSelections(cityCache[provinceid], 'city', null, true);
	    } else {
	      setCities(provinceid, setCityOptions);
	    }
	  }
	});

  var setCityOptions = function (cities){
    setSelections(cities, 'city', null, true);
  }

  /// assing options to the 'city' select input
  ///
  ///  provinceid - the id of the province
  ///  callback   - the method which needs city json as input  
  function setCities(provinceid, callback, async) { 
    if (provinceid == null){
      return;
    }
    if (provinceid == 10000){
  		// no cities if all country has been selected
  	  setSelections([], 'city');
      return;
    }

    if (async == undefined) { async = true; } 
    
    var docUrl = document.URL;
    var js_path = docUrl.substring(0, docUrl.lastIndexOf('/')) + '/js/';
    
    var url = js_path + 'city/cities_' + provinceid + '.js'; 
    $.cachedScript(url, {async:async}).done(function(data, textStatus) { 
      var cities = eval('cities_' + provinceid);
      cityCache[provinceid] = cities;
      callback(cities);
    });
  }

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
    if (city == undefined || city == -1) { city=''; }
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
  page.c = {};   // initialize the company cache
  page.j = {};   // initialize the job cache

  var tout = 15000; // the default timeout value

  var lastViewedJid = '';
  var base = 'http://www.boryi.com:8080/SearchJobs/';
  var jobUrlForTotal = "";

  var searchJob = function(form){ 
    waitLoading.show('search-btn');
    $('#search-btn').attr({"disabled":"disabled"});

    var targetUrl = base + 'jobs?';
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
      targetUrl += '&s10=' + cmptype;                           // 公司性质
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

    jobUrlForTotal = targetUrl;
    tooMuchResult.hide();
    lastViewedJid = '';

    $('#tab-detail').unbind('click');

    $.ajax({
        url: targetUrl,
        dataType: "jsonp", 
        jsonpCallback: "_jobs", 
        cache: true,
        timeout: tout, 
    }).done(function(d) {
        if (d.t == 0){
          alert('没有找到符合条件的结果，请修改查询条件重试');          
        } else {
          // clear the list first
          $('ul.list').empty();
          // set global trackers
          page.currentp = 1;  // initialize the current page tracker mark
          page.currentq = 0;  // initialize the current query id mark
          page.total = 0;     // initialize the total result mark
          page.c = {};        // initialize the company cache
          page.j = {};        // initialize the job cache
          
          // enable the list and detail tab
          $('#tab-list').bind('click', tabHandler);
          $('#tab-list').bind('click', function(){
            // if return to check list again from detail page,
            // jump to the latest viewed job list item
            if (lastViewedJid){
              view(lastViewedJid);  
            }
          });

          // display results in the list tab 
          showJobs(d);

          waitLoading.stop();
          $('#search-btn').removeAttr('disabled');
        }
    }).fail(function(xhr, status, msg) {
        waitLoading.stop();
        $('#search-btn').removeAttr('disabled');
        alert('网络不太给力，请重试');
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
    if ((page.total - 1) / 20 < page.currentp++){
      $('#more').hide();
    } else {
      $('#more').show();
    }
    if (page.currentp == 21){
      tooMuchResult.show();
    }


    var companies = json['c'];
    var jobs = json['j'];

    if (jobs.length == 20 && page.total == 0)
    {
      // probably has more than 20 items, try to collect the total
      $('#more').html('更多结果正在查询中...').addClass('disabled').show().unbind('click');
      
      if (jobUrlForTotal.length > 0){
        var maxRetry = 3;
        var targetUrl = jobUrlForTotal.replace("/jobs?", "/total?");


        var getTotalNum = function(){
          $.ajax({
              url: targetUrl,
              dataType: "jsonp", 
              jsonpCallback: "_ttl" + Date.now(), 
              cache: true,
              timeout: tout, 
          }).done(function(d) {
            if (d.t > 0){
              var t = d['t'];
              page.total = t;

              $('#more').html('显示更多结果...').removeClass('disabled')
                .show().bind('click', getMoreJobs);
            }
          }).fail(function(xhr, status, msg) {
              // shouldn't alert() anything, or it will interrup the iteration
              if (maxRetry-- > 0){
                setTimeout(getTotalNum, 5000);
              } else {
                $('#more').html('显示更多结果...').removeClass('disabled')
                  .show().bind('click', getMoreJobs);;
              }
          });  
        }

        setTimeout(getTotalNum, 5000);
      }
    }

    for (var i = 0; i <= companies.length - 1; i++) {
      var company = companies[i];

      var cid = company.id.toString();
      // u cannot directly use company.id as the key of cached data,
      // we must conver it to a string first, like this

      // check if this company has alreay been cached
      var cachedCmp = $(page.c).data(cid);
      if (cachedCmp === undefined){
        // new company cached
        $(page.c).data(cid, company);
      }
    }

    var li = $('<li />').addClass('list-item');
    var fc = $('<div />').addClass('fc');
    var fbc = fc.addClass('fb');
    var fr = $('<div />').addClass('fr');
    var fl = $('<div />').addClass('fl');
    var cmp = $('<div />').addClass('fl fb w75');

    var title_div = $('<div />').addClass('list-title fb');

    for (var i = 0; i <= jobs.length - 1; i++) {
      var job = jobs[i];
      var jid = job['cid'] + '-' + job['jid'];
      // check if this job has alreay been cached
      var cachedJob = $(page.j).data(jid);
      if (cachedJob === undefined){
        // new company cached
        $(page.j).data(jid, job);
      }

      var title = title_div.clone().append(job['ttl']).wrap('<div />');

      var list = li.clone();
      list.append(title);
      list.append(fc.clone()
            .append(cmp.clone().append(
                map_id_attr(companies, job['cid'], 'nm'))
            )
            .append(fr.clone().append(job['rfr']))
      );

      list.append(fbc.clone()
            .append(fl.clone().append(showRange(job['slr'], '元以上', '元以下', '元', ' ~ ')))
            .append(fr.clone().append('消息来源:' + sources[job['src'][0]['sid'] - 1]))
      ).append(fc.clone());
      
      $('ul.list').append(list.attr({'id':jid}));
    }

    $('.list .list-item').click(function(){

      $('#tab-detail').bind('click', tabHandler);
      $('#tab-detail').bind('click', function(){
        window.scrollTo(0, 0);
      });


      $(this).addClass('viewed');

      $('#cmp-location').empty();
      $('#job-location').empty();
      
      $('#tab-detail').trigger('click');
      var v = $(this).addClass('viewed').attr('id').split('-');
      lastViewedJid = this.id;

      showJobDetails(v[0], v[1]);
    })
  }

  /// display job details
  ///
  /// cid: company id
  /// jid: job id
  function showJobDetails(cid, jid){
    var company = $(page.c).data(cid); 
    var job = $(page.j).data(cid + '-' + jid); 

    $('#company').html(company.nm); 
    $('#title').html(job.ttl); 
    $('#refreshdate').html(job.rfr); 
    $('#source').html(sources[job.src[0]['sid'] - 1]); 

    $('#apply-source').click(function(){ 
        //location.href = job.src[0]['url']; 
        window.open(job.src[0]['url'], '_blank');
    }); 
    
    $('#salary-str').html(showRange(job.slr, '元以上', '元以下', '元', ' ~ '));

    var edu = job.edu;
    var xpr = job.xpr;
    var gnd = job.gnd;
    var age = job.age;
    var hgh = job.hgh;
    var lng = job.lng;
    var wrk = job.wrk;
    
    var bnf = job.bnf;
    var ftr = job.ftr;

    var rqs = '';
    var bns = '';
    
    if (edu){
      rqs += educations[edu - 1] + ' &middot; ';
    }
    if (xpr){
      rqs += xpr + '年以上工作经验 &middot; ';
    }
    if (gnd){
      rqs += genders[gnd] + '&middot; ';
    }
    if (age){
      var age_str = '';
      var male_age = showRange(age.slice(0, 2), '岁以上', '岁以下', '岁', ' - ');
      var female_age = showRange(age.slice(2), '岁以上', '岁以下', '岁', ' - ');
      if (male_age){
        age_str += '男：' + male_age;  
      }
      if (female_age){
        if (male_age){
          age_str += ', ';
        }
        age_str += '女：' + female_age;  
      }
      
      rqs += age_str + '&middot; ';
    }

    if (hgh){
      var hgh_str = '';
      hgh_str += '男：' + showRange(hgh.slice(0, 2), 'CM以上', 'CM以下', 'CM', ' - ');
      hgh_str += ', 女：' + showRange(hgh.slice(2), 'CM以上', 'CM以下', 'CM', ' - ');
      rqs += hgh_str + '&middot; ';
    }

    if (lng){
      var lng_str = '';
      for (var i = 0; i < lng.length; i++) {
        var lng_id = lng[i];
        var lng_name = '';

        if (lng_id % 1000 == 0){
          lng_name = map_id_attr(languages, lng_id, 'n');
        } else {
          var index = parseInt(lng_id / 1000) - 1;
          lng_name = map_id_attr(languages[parseInt(lng_id / 1000) - 1].s, lng_id, 'n');
        }
        lng_str += lng_name + ', ';  
      }
      if (lng_str){
        // remove the last ',' and ' '
        lng_str = lng_str.substring(0, lng_str.length - 2);
      }
      rqs += lng_str + '&middot; ';
    }

    if (bnf){
      var bnf_str = '';
      for (var i = 0; i < bnf.length; i++) {
        bnf_str += benefits[bnf[i] - 1] + ', ';
      }
      if (bnf_str){
        // remove the last ',' and ' '
        bnf_str = bnf_str.substring(0, bnf_str.length - 2);
      }
      bns += bnf_str + '&middot; ';
    }

    if (ftr){
      var ftr_str = ''; 
      for (var i = 0; i < ftr.length; i++) { 
        ftr_str += '无' + features[ftr[i] - 1] + ', '; 
      }
      if (ftr_str){
        // remove the last ',' and ' '
        ftr_str = ftr_str.substring(0, ftr_str.length - 2);
      }
      bns += ftr_str + '&middot; ';
    }

    if (rqs.length){
      // remove the last extra '&middot; '
      rqs = rqs.substring(0, rqs.length - 9);
    }
    if (bns.length){
      // remove the last extra '&middot; '
      bns = bns.substring(0, bns.length - 9);
    }

    $('#requirement-list').html(rqs);
    $('#benefit-list').html(bns);

    if (company.ty){
      var cmpType = companyTypes[(company.ty - 1)];
      $('#cmp-type-str').html(cmpType);  
    }

    var size = company.sz;
    var size_str = '';
    if (size){
      $('#cmp-size-str').html(showRange(size, '人以上', '人以下', '人', ' - '));
    }

    if (wrk){
      var wrk_str = '';
      $.each(wrk, function(index, value){
        wrk_str += worktypes[value - 1] + '/';
      })  
      $('#work-type').html(wrk_str.substring(0, wrk_str.length - 1));
    }


    setLocation(company['lc'].toString(), 'cmp-location');

    var locs = job['lct'];

    var job_cities = [];
    for (var i = 0; i < locs.length; i++) { 
      var loc_str = locs[i].toString();
      var city = loc_str.substr(0, 5); 

      // check if the city has been added, we need to ignore 
      // districts of the same city 
      if ($.inArray(city, job_cities) !== -1){
        continue;
      } else {
        job_cities.push(city);  
      }

      if (i == 0){
        setLocation(loc_str, 'job-location');
      } else {
        setLocation(loc_str, 'job-location', true);  
      }
    }

    /// conver the location code to corresponding location
    ///
    /// loc     - the location code
    /// target  - id of the DOM object containing the location information
    /// ismulti - if the target has more than one location to display, this 
    ///           is use to indicating whether to put a '/' mark ahead of location
    function setLocation(loc, target, ismulti){ 
      var cn = loc.substr(0, 1); 
      var province = loc.substr(1, 2); 
      var city = loc.substr(1, 4); 
      // set the company's location 
      if (!cn){
        $('#' + target).append('<span>国外</span>');
      } else {
        // in CN
        if (loc == '1000000000000000'){
          $('#' + target).append('全国');
          return;
        }

        var provinceid = province * 100;
        var prov_str = map_id_attr(provinces, provinceid);
        
        var city_str = '';

        var setCmpLocation = function(cities){ 
          city_str = map_id_attr(cities, city); 
          if (city_str){
            city_str = '-' + city_str;
          }
          var t = $('#' + target);
          t.append('<span>');
          if (ismulti){
            t.append('/');  
          }
          t.append(prov_str + city_str + '</span>');
        }

        if (cityCache.hasOwnProperty(provinceid)){
          setCmpLocation(cityCache[provinceid]);
        } else {
          setCities(provinceid, setCmpLocation);
        }
      }  
    }

    var jobUrl = base + 'job?c=' + cid + '&j=' + jid;

    function showPropStr(item, parent, block){
        if(item){
          $('#' + parent).html(item);
          $('#' + block).show();
        } else {
          $('#' + block).hide();
        }
    }

    function showPropArr(arr, parent, block, href_prefix, id_prefix, val_appenix){
      if (arr){
        var items = arr.split(',');
        $(parent).empty();
        
        val_appenix = val_appenix || '';

        var str = '';
        $.each(items, function(index, value){
            var e = $('<a>').attr('href', href_prefix + ':' + value)
                          .attr('id', id_prefix + index).html(value + val_appenix + '<br />');
            str += e.wrap('<div>').parent().html();
        })

        showPropStr(str, parent, block);
      }
    }

    $.ajax({
        url: jobUrl,
        dataType: "jsonp", 
        jsonpCallback: "_job", 
        cache: true,
        timeout: tout,
    }).done(function(j) {
        $('#postdate').html(j['ffd']); 

        showPropStr(j['dsc'], 'description', 'description-block');
        showPropStr(j['rqr'], 'requirement', 'requirement-block');
        showPropStr(j['cnt'], 'contact', 'contact-block');

        showPropArr(j['eml'], 'email', 'email-block', "mailto", "email");
        showPropArr(j['phn'], 'phone', 'phone-block', "tel", "phone", '[<span class="call">拨打</span>]');
        showPropArr(j['mbl'], 'cell', 'cell-block', "tel", "mobile", '[<span class="call">拨打</span>]');
    }).fail(function(xhr, status, msg) { 
        alert('网络不太给力，拿不到工作信息，请重试'); 
    }); 
  }

  var getMoreJobs = function(){
    waitLoading.show('more');
    // don't want it to scroll here 
    lastViewedJid = '';
    var targetUrl = base + 'jobs?q=' + page.currentq + '&p=' + page.currentp;

    $.ajax({
        url: targetUrl,
        dataType: "jsonp", 
        jsonpCallback: "jcb", 
        cache: true,
        timeout: tout,
    }).done(function(d) {
        waitLoading.stop();
        // display results in the 2nd tab
        showJobs(d); 
    }).fail(function(xhr, status, msg) { 
        waitLoading.stop();
        alert('网络不太给力，请重试'); 
    }); 
  }

  // load another 20 results if there exists 
  $('#more').bind('click', getMoreJobs);

  // rule to make sure that at least one checkbox is checked
  $.validator.addMethod("keywordtype", function(value, elem, param) {
      return $(".work-group:checkbox:checked").length > 0;
  }, "");

  // the form validator
	var validator = $("#search").validate({
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

    $("#reset-btn").on("click", function(event){
      validator.resetForm();
      $('#city').hide();
    })
});