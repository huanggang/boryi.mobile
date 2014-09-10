$(document).ready(function(){

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
	      setSelections(cityCache[provinceid], 'city');
	    } else {
	      setCities(provinceid, setCityOptions);
	    }
	  }
	});

  var setCityOptions = function (cities){
    setSelections(cities, 'city');
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
      //setSelections(cities, 'city');
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
  page.c = {};   // initialize the company cache
  page.j = {};   // initialize the job cache

  var base = 'http://www.boryi.com:8080/SearchJobs/';

  var searchJob = function(form){ 
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

    $.ajax({
        url: targetUrl,
        dataType: "jsonp", 
        jsonpCallback: "_jobs", 
        cache: true,
        timeout: 5000, 
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
          $('#tab-list, #tab-detail').click(tabHandler);

          // display results in the list tab 
          showJobs(d);          
        }
    }).fail(function(xhr, status, msg) {
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

    if ((page.total - 1) / 20 <= page.currentp++){
      $('#more').hide();
    } else {
      $('#more').show();
    }

    var companies = json['c'];
    var jobs = json['j'];

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
            .append(fl.clone().append(showRange(job['slr'], '元以上', '元以下', '元', '~')))
            .append(fr.clone().append('消息来源:' + sources[job['src'][0]['sid']]))
      ).append(fc.clone());
      
      $('ul.list').append(list.attr({'v':jid}));
    }

    $('.list .list-item').click(function(){
      $(this).addClass('viewed');

      $('#tab-detail').trigger('click');
      var v = $(this).addClass('viewed').attr('v').split('-');

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
//    $('#postdate').html(job.ttl); 

    $('#refreshdate').html(job.rfr); 
    $('#source').html(sources[job.src[0]['sid']]); 

    $('#apply-source').click(function(){ 
        location.href = job.src[0]['url']; 
    }); 
    
    $('#salary-str').html(showRange(job.slr, '元以上', '元以下', '元', '~'));

    var edu = job.edu;
    var xpr = job.xpr;
    var gnd = job.gnd;
    var age = job.age;
    var hgh = job.hgh;
    var lng = job.lng;
    
    var bnf = job.bnf;
    var ftr = job.ftr;

    var rqs = '';
    if (edu){
      rqs += educations[edu - 1] + '以上 &middot; ';
    }
    if (xpr){
      rqs += xpr + '年以上工作经验 &middot; ';
    }
    if (gnd){
      rqs += genders[gnd - 1] + '&middot; ';
    }
    if (age){
      var age_str = '';
      age_str += '男：' + showRange(age.slice(0, 2), '岁以上', '岁以下', '岁', '-');
      age_str += ', 女：' + showRange(age.slice(2), '岁以上', '岁以下', '岁', '-');
      rqs += age_str + '&middot; ';
    }
    
    if (hgh){
      rqs += hgh + '&middot; ';
    }
    if (lng){
      rqs += lng + '&middot; ';
    }
    if (bnf){
      rqs += bnf + '&middot; ';
    }
    if (ftr){
      rqs += ftr + '&middot; ';
    }
    $('#requirement-list').html(rqs);

    




    console.log('...this is job...');
    console.log(job);


    
    if (company.ty){
      var cmpType = companyTypes[(company.ty - 1)];
      $('#cmp-type-str').html(cmpType);  
    }

    var size = company.sz;
    var size_str = '';
    if (size){
      $('#cmp-size-str').html(showRange(size, '人以上', '人以下', '人', '-'));
    }

    var loc = company['lc'].toString();
    var cn = loc.substr(0, 1);
    var province = loc.substr(1, 2);
    var city = loc.substr(1, 4);

    // set the company's location 
    if (!cn){
      $('#cmp-location').html('国外');
    } else {
      // in CN
      var provinceid = province * 100;
      var prov_str = map_id_attr(provinces, provinceid);
      
      var city_str = '';
      var setCmpLocation = function(cities){
        city_str = map_id_attr(cities, city);
        if (city_str){
          city_str = '-' + city_str;
        }
        $('#cmp-location').html(prov_str + city_str);
      }

      if (cityCache.hasOwnProperty(provinceid)){
        setCmpLocation(cityCache[provinceid]);
      } else {
        setCities(provinceid, setCmpLocation);
      }





      //$('#cmp-location').html(province);
    }


    var jobUrl = base + 'job?c=' + cid + '&j=' + jid;

    $.ajax({
        url: jobUrl,
        dataType: "jsonp", 
        jsonpCallback: "_job", 
        cache: true,
        timeout: 10000,
    }).done(function(j) {
        console.log('...job...');
        console.log(j);
        $('#postdate').html(j['ffd']); 

        if(j['dsc']){
          $('#description').html(j['dsc']);
          $('#description-block').show();
        } else {
          $('#description-block').hide();
        }

        if(j['rqr']){
          $('#requirement').html(j['rqr']);  
          $('#requirement-block').show();
        } else {
          $('#requirement-block').hide();
        }

        if(j['eml']){
          var email = j['eml']; 
          $('#email').html(email).attr('href', 'mailto:' + email);   
          $('#email-block').show();
        } else {
          $('#email-block').hide();
        }
        
        if (j['cnt']){
          $('#contact').html(j['cnt']); 
          $('#contact-block').show();   
        } else {
          $('#contact-block').hide();
        }
        
        if (j['phn']){
          var phones = j['phn'].split(',');
          var phones_str = '';
          for (var i = phones.length - 1; i >= 0; i--) { 
            phones_str += '<a id="phone' + i + '" href="tel:' + $.trim(phones[i].replace(/\s+-\(\)/g, '')) + '" >' + phones[i] + '[<span class="call">拨打</span>]<br />';
          };
          $('#phone').html(phones_str);  
          $('#phone-block').show();
        }

        if (j['mbl']){
          var mobiles = j['mbl'].split(',');
          var mobiles_str = '';
          for (var i = mobiles.length - 1; i >= 0; i--) {
            mobiles_str += '<a id="mobile' + i + '" href="tel:' + $.trim(mobiles[i].replace(/\s+-\(\)/g, '')) + '" >' + mobiles[i] + '[<span class="call">拨打</span>]<br />';
          };
          $('#mobile').html(mobiles_str);  
          $('#mobile-block').show();
        }
    }).fail(function(xhr, status, msg) { 
        alert('网络不太给力，拿不到工作信息，请重试' + msg + status); 
    }); 

  }

  // load another 20 results if there exists 
  $('#more').click(function(){
    var targetUrl = base + 'jobs?q=' + page.currentq + '&p=' + page.currentp;

    $.ajax({
        url: targetUrl,
        dataType: "jsonp", 
        jsonpCallback: "jcb", 
        cache: true,
        timeout: 10000,
    }).done(function(d) {
        // display results in the 2nd tab
        showJobs(d); 
    }).fail(function(xhr, status, msg) { 
        alert('网络不太给力，请重试'); 
    }); 
  });

  // the form validator
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