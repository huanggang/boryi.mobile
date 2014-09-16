$(document).ready(function(){
    //fill the province first,setSelections defined in mobilecommon.js
    setSelections(provinces, 'province', 10000);
    
    $('#province').change(function(event) {
        var provinceid = $("#province option:selected").val();
        setCitiesByProvinceId(provinceid,'city');
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
    var resultClicked = false;
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

        var li = $('<li />').addClass('list-item');
        var titleDiv = $('<div />').addClass('list-title fb');
        var compDiv = $('<div />').addClass('fc').addClass('fb');
        var miscDiv = $('<div />').addClass('fc').addClass('fb');
        var bottomDiv = $('<div />').addClass('fc');
        var div = $('<div />');
        
        parseJobData(json);

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

        $('.list .list-item').click(function(){
            if(!resultClicked){
                resultClicked=true;
                $('#details-result').removeClass("hd");
                $('.no-detail').addClass("hd");
            }
            $('#tab-detail').trigger('click');
            var id = $(this).addClass('viewed').attr('id');
            showJobDetails(id);
        })
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
    
    function k(s){if(s==1){return"实习"}else{if(s==2){return"校招"}else{if(s==3){return"社招"}}}return""}
    function b(s){if(s==1){return"国企"}else{if(s==2){return"外企"}else{if(s==3){return"民企"}else{if(s==4){return"其他"}}}}return""}

    function showJobDetails(listid){
        $('.detail-top .src-btn').wrap("<a target='_blank' href='" + page.j[listid].u + "'></a>");
        $('.ui-tab-content iframe').attr({src: page.j[listid].u});
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
