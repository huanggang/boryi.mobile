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
  
    //fill the province first,setSelections defined in mobilecommon.js
    setSelections(provinces, 'province', 10000);
    $('#city').hide();
    $('#province').change(function(event) {
        var provinceid = $("#province option:selected").val();
        setCitiesByProvinceId(provinceid,'city');
    });
    // load another 20 results if there exists 
    $('#more').click(getMoreJobs);
    $('#search-btn').removeAttr("disabled");
    $("#search").validate({
        errorPlacement: errPlace,
        submitHandler: searchJob,
        rules: { 
            keyword: { 
                maxlength: 40, 
            }, 
        }, 
        messages: { 
            keyword: { 
                maxlength: "关键字不能超过40个字符",
            }, 
        },
    });
    $('.ui-tab-content iframe').attr("src","");
    $('#reset-btn').click(function(){
        $('#city').hide().empty();
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
    var page = {}; // the page option
    var resultClicked = false;
    var lastViewedJid;
    var base = 'http://www.boryi.com:8080/SearchJobs2/';
    var firstPageUrl = "";

    function searchJob(){
        //initialize
        $('.ui-tab-content iframe').attr("src",""); // always clear the src when research.
        $('#tab-detail').unbind("click",tabHandler);//unbind the details page again
        
        
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
        
        var jobtype = getSelected('job-type');
        if (jobtype.length > 0){
            targetUrl += '&s4=' + jobtype; // 工作类型
        }

        firstPageUrl = targetUrl;
        $('#search-btn').attr("disabled",true);

        waitLoading.show("search-btn");

        $.ajax({
            url: targetUrl,
            dataType: "jsonp", 
            jsonpCallback: "_jobs", 
            cache: true,
            timeout: 5000, 
        }).done(function(d) {
            $('#search-btn').removeAttr("disabled");
            waitLoading.stop();
            if (d.t == 0){
                alert('没有找到符合条件的结果，请修改查询条件重试');          
            } else {
                // clear the list first
                $('ul.list').empty();
                // set global trackers
                page = {};
                page.currentp = 1;  // initialize the current page tracker mark
                page.currentq = 0;  // initialize the current query id mark
                page.total = 0;     // initialize the total result mark
                page.j = [];     // initialize the job cache
                lastViewedJid = null;
                // enable the list and detail tab
                $('#tab-list').bind("click",tabHandler);
                $('#tab-list').bind("click",function(){
                    if (lastViewedJid){
                        view(lastViewedJid);  
                    }
                 });

                // display results in the list tab 
                $('#tab-list').trigger('click');
                tooMuchResult.hide();
                showJobs(d);
                window.scroll(0,0);
            }
        }).fail(function(xhr, status, msg) {
            waitLoading.stop();
            $('#search-btn').removeAttr("disabled");
            alert('网络出现问题，请刷新页面。');
        });
    }

    /// display searching results 
    function showJobs(json){
        
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
        }
        else if(page.currentp == 21){
            tooMuchResult.show();
            $('#more').hide();
        }
        else {
            $('#more').show();
        }
        
        parseJobData(json);
        fillJobData(json['j']);
        Array.prototype.push.apply(page.j,json['j']);
        
        $('.list .list-item').click(function(){
            if(!resultClicked){
                resultClicked=true;
                $('#details-result').removeClass("hd");
                $('.no-detail').addClass("hd");
            }
            $('#tab-detail').bind("click",tabHandler);
            $('#tab-detail').bind('click', function(){
                window.scrollTo(0, 0);
            });
            
            $('#tab-detail').trigger('click');
            var id = $(this).addClass('viewed').attr('id');
            lastViewedJid = id;
            showJobDetails(id);
        })

        if (page.total == 0 && page.j.length == 20)
        {
            // probably has more than 20 items, try to collect the total
            getTotalNumByRetry('more',firstPageUrl,3,5000,function(d){page.total = d.t;});
        }
    }

    function fillJobData(jobdata){
        var li = $('<li />').addClass('list-item');
        var titleDiv = $('<div />').addClass('list-title fb');
        var compDiv = $('<div />').addClass('fc').addClass('fb');
        var miscDiv = $('<div />').addClass('fc').addClass('fb');
        var bottomDiv = $('<div />').addClass('fc');
        var div = $('<div />');
        jobdata.forEach(function(job,index){
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
                        .append((job.cominfo.t || job.r) && div.clone().addClass("fr mgr10")
                                .append((job.cominfo.t && job.r)? job.cominfo.t + "·" + job.r:job.cominfo.t||job.r))
                       ).append(bottomDiv.clone());
            $('ul.list').append(list.attr({id:"li" + (page.j.length + index)}));
        });
    }
    
    //convert the number code to string data.
    //as well as add company info for each job
    function parseJobData(json){
        json['c'].forEach(function(ele){
            ele.t = b(ele.t);
        });

        json['j'].forEach(function(ele,index){
            json['c'].forEach(function(cele){
                if(cele.c == ele.c){
                    ele.cominfo = cele;
                }
            });
            ele.e = educations[ele.e-1];
            ele.r = k(ele.r);
        });
    }
    
    function k(s){
        return ["实习","校招","社招"][s-1] || "";
    }
    function b(s){
        return ["国企","外企","民企","其他"][s-1] || "";
    }

    function showJobDetails(listid){
        $('.detail-top a').attr("href",page.j[listid.substring(2)].u);
        $('.ui-tab-content iframe').attr({src: page.j[listid.substring(2)].u});
    }


    function getMoreJobs(){
        var targetUrl = base + 'jobs?q=' + page.currentq + '&p=' + page.currentp;
        waitLoading.show("more");
        $("#more").hide();
        $.ajax({
            url: targetUrl,
            dataType: "jsonp", 
            jsonpCallback: "jcb", 
            cache: true,
            timeout: 10000,
        }).done(function(d) {
            waitLoading.stop();
            $("#more").show();
            // display results in the 2nd tab
            showJobs(d); 
        }).fail(function(xhr, status, msg) {
            waitLoading.stop();
            $("#more").show();
            alert('网络出现问题，请刷新页面。'); 
        }); 
    }

});
