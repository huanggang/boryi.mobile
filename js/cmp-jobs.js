$(document).ready(function(){
    //fill the province first,setSelections defined in mobilecommon.js
    setSelections(provinces, 'province', 10000);
    
    $('#province').change(function(event) {
        var provinceid = $("#province option:selected").val();
        SetCitiesByProvinceId(provinceid,'city');
    });

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

    var base = 'http://www.boryi.com:8080/SearchJobs2/';

    $("#search-btn").click(function(){ 
        var targetUrl = base + 'jobs?';
        targetUrl += 's1='  + getWorkPlace(); // 工作地点
        
        var cmptype = getSelected('cmp-type');
        if(cmptype>0){
            targetUrl += '&s2=' + cmptype; // 公司性质
        }

        var keyword = $.trim($("#keyword").val());
        if (keyword.length > 0){
            targetUrl += '&s3=' + keyword; // 关键字
        }
        else
        {
            return; //don't send request if the keyword was not inputed.
        }
        
        var jobtype = getSelected('job-type');
        if (jobtype.length > 0){
            targetUrl += '&s4=' + jobtype; // 工作类型
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
                page.j = [];     // initialize the job cache
                
                // enable the list and detail tab
                $('#tab-list, #tab-detail').click(tabHandler);

                // display results in the list tab 
                showJobs(d);          
            }
        }).fail(function(xhr, status, msg) {
            alert('网络不太给力，请重试');
        });
    });

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


        // //cache the returned companies
        // companies.forEach(function(ele,index){
        //     var cid = ele.c;
        //     if(!page.c.hasOwnProperty(cid)){
        //         page.c[cid]=ele;
        //     }
        // });

        var li = $('<li />').addClass('list-item');
        var titleDiv = $('<div />').addClass('list-title fb');
        var compDiv = $('<div />').addClass('fc').addClass('fb');
        var miscDiv = $('<div />').addClass('fc').addClass('fb');
        var bottomDiv = $('<div />').addClass('fc');
        var div = $('<div />');
        
        json['c'].forEach(function(ele){
            ele.t = b(ele.t);
        });

        var companies = json['c'];
        var jobs = json['j'];
        json['j'].forEach(function(ele,index){
            json['c'].forEach(function(cele){
                if(cele.c == ele.c){
                    ele.cominfo = cele;
                }
            });
            ele.e = educations[ele.e-1];
            ele.r = k(ele.r);
        });

        json['j'].forEach(function(job,index){
            // e:学历
            // p:日期
            // r:招聘类型
            // t:标题
            // cominfo.n:公司名
            // cominfo.t:公司性质

            var list = li.clone();
            list.append(titleDiv.clone().append(job.t));
            list.append(compDiv.clone().append(job.cominfo.n));
            list.append(miscDiv.clone()
                        .append(div.clone().addClass("fl").append(job.e))
                        .append(div.clone().addClass("fr").append(job.p))
                        .append((job.cominfo.n || job.r) && div.clone().addClass("fr mgr10")
                                .append((job.cominfo.t && job.r)? job.cominfo.t + "·" + job.r:job.cominfo.t||job.r))
                       ).append(bottomDiv.clone());
            $('ul.list').append(list.attr({'id':page.j.length + index}));
        });

        Array.prototype.push.apply(page.j,json['j']);

        // $('.list .list-item').click(function(){
        //     $(this).addClass('viewed');

        //     $('#tab-detail').trigger('click');
        //     var v = $(this).addClass('viewed').attr('v').split('-');

        //     showJobDetails(v[0], v[1]);
        // })
    }
    
    function k(s){if(s==1){return"实习"}else{if(s==2){return"校招"}else{if(s==3){return"社招"}}}return""}
    function b(s){if(s==1){return"国企"}else{if(s==2){return"外企"}else{if(s==3){return"民企"}else{if(s==4){return"其他"}}}}return""}

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
            var male_age = showRange(age.slice(0, 2), '岁以上', '岁以下', '岁', '-');
            var femail_age = showRange(age.slice(2), '岁以上', '岁以下', '岁', '-');
            if (male_age){
                age_str += '男：' + male_age;  
            }
            if (femail_age){
                if (male_age){
                    age_str += ', ';
                }
                age_str += '女：' + femail_age;  
            }
            
            rqs += age_str + '&middot; ';
        }

        if (hgh){
            var hgh_str = '';
            hgh_str += '男：' + showRange(hgh.slice(0, 2), 'CM以上', 'CM以下', 'CM', '-');
            hgh_str += ', 女：' + showRange(hgh.slice(2), 'CM以上', 'CM以下', 'CM', '-');
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
                    console.log('语言');
                    console.log(index);
                    console.log(languages[index]);
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
                ftr_str += features[ftr[i] - 1] + ', ';
            }
            if (ftr_str){
                // remove the last ',' and ' '
                ftr_str = ftr_str.substring(0, ftr_str.length - 2);
            }
            bns += ftr + '&middot; ';
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
                $('#cell').html(mobiles_str);  
                $('#cell-block').show();
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
});
