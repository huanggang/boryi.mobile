/// assing options to a select input
///
///  json   - the json string
///  target - id of the select input 
///  value  - the default value
function setSelections(json, target, value, hasDefault){
    var len = json.length;
    var target = $('#' + target);
    if (len == 0){
        target.hide();
    } else {
        target.show();
    }
    target.empty();
    if (hasDefault){
        target.append('<option value="-1">-</option>');    
    }
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

/// get any json property according to 'id' property
/// if not given, attr would be set to 'name'
function map_id_attr(jsons, id, attr){
    if (typeof attr == "undefined"){
        attr = 'name';
    }
    for (var i = 0; i < jsons.length; i++){
        var j = jsons[i];
        if (j.id == id) {
            return j[attr];
        }
    }
    return '';
};

/// get the value of the selected option
function getSelected(select){
    return $("#" + select + " option:selected").val();
}

/// Default method which customs how error label displayed
/// for form validation
var errPlace = function(error, element) {
    element.parent().append(error);
}

/// Display the range of a json , such as company size range
/// and salary range, etc.
function showRange(range, lowstr, highstr, unit, range_concat){
        var result = '';
        var r = range || [];
        if (r.length == 2){
          if (r[0] == null && r[1] > 0){
            return r[1] + highstr;
          } else if (r[0] > 0 && r[1] == null){
            return r[0] + lowstr;
          } else if (r[0] > 0 && r[1] > 0){
            return r[0] + range_concat + r[1] + unit;
          } 
        }
        return result;
}

/// when come back to the job list from a job's detail page, we should 
/// make the tab scroll to the latest checked job, since there might 
/// be a very, very long job list
function view(id){
    if (id){
        var t = $('#' + id).offset();
            if (t.hasOwnProperty('top')){
                $('html, body').animate({
                    scrollTop: t.top
                }, 0);
            }       
        }
}

function setCitiesByProvinceId(provinceid,target,async){
    
    if (provinceid == null){
        return;
    }
    if (provinceid == 10000){
        // no cities if all country has been selected
        setSelections([], target);
        return;
    }
    async = async || true;

    setCityFunction(provinceid,target,async);

}

function getSetCityFunction(){
    var cityCache = {};
    return function (provinceid,target,async){
        
        if(cityCache.hasOwnProperty(provinceid)){
            setSelections(cityCache[provinceid], target);
        }
        else{
            var url = 'js/city/cities_' + provinceid + '.js';
            var cities;
            $.ajax({
                dataType: "script",
                cache: true,
                url: url,
                async: async,}).done(function(){
                    cities = eval('cities_' + provinceid);
                    cityCache[provinceid] = cities;
                    setSelections(cities,target);
                });
        }
    }
}

var setCityFunction = getSetCityFunction();

var tooMuchResult = {
    divele:null,
    diveleAdded:false,
    show:function (){
        this.divele || (this.divele=$("<div style='text-align:center;padding:8px 0px'>结果超过400条</div>"));
        $('#more').parent().append(this.divele);
        this.diveleAdded = true;
    },
    hide:function (){
        if(this.diveleAdded){
            this.diveleAdded = false;
            this.divele.remove();    
        }
    }
};

var waitLoading = {
    loadingDiv:$("<div style='text-align:center;padding:8px 0px' class='fc'></div>"),
    lastTarget:null,
    text:["·&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;","··&nbsp;&nbsp;&nbsp;","···&nbsp;&nbsp;","····&nbsp;","·····"],
    timer:null,
    show:function(target,content){
        //check whether target is a string,and convert it to a JQurey object if it is.
        if(typeof target == "string" || typeof target== "object" && target instanceof String){
            target = $("#" + target);
        }
        if(!this.lastTarget || this.lastTarget.attr('id') != target.attr('id')){
            this.lastTarget = target;
            this.loadingDiv.appendTo(target.parent());
        }
        this.loadingDiv.text(content || "搜索中").show();
        var tloadingDiv = this.loadingDiv;
        var i = 0;
        var text = this.text;
        this.timer && clearInterval(this.timer); //clear the timer if there is any to avoid memory leak
        this.timer = setInterval(function(){
            tloadingDiv.html((content || "搜索中") + text[i++%(text.length)]);
        },500);
    },
    stop:function(){
        this.timer && (clearInterval(this.timer),this.timer=null);
        this.loadingDiv.hide();
    },
}

//call this function send request when the website didn't return a t(total)
//@target should be 'more' or a more JQeury Object.
//@url is the url use to query data of the first page.
//@maxRetry is the retries tiems.
//@lag is the delay time to retry send request.
//@callback callback function use to set values
function getTotalNumByRetry(target,url,maxRetry,lag,callback){
    //if target is not a string, we assume that it is a JQeury Object and get it's id.
    if(typeof target != "string" && !target instanceof String){
        target = target.attr("id");
    }

    waitLoading.show(target,'更多结果正在查询中');
    $('#' + target).hide()       // hide the more div
    if (url.length > 0){
        var targetUrl = url.replace("/jobs?", "/total?");
        function getTotalNum(){
            $.ajax({
                url: targetUrl,
                dataType: "jsonp", 
                jsonpCallback: "_ttl" + Date.now(), 
                cache: true,
                timeout: 5000,
            }).done(function(d) {
                if(d.t>0){
                    waitLoading.stop();
                    callback(d);
                    if (d.t > 20){//only show the more again when there are more than 20 results
                        $('#' + target).show();
                    }
                } else {        // t is not returned, we should retry
                    if (maxRetry-- > 0){
                        setTimeout(getTotalNum, lag);
                    } else {
                        waitLoading.stop();
                        $('#' + target).show();
                    }
                }
            }).fail(function(xhr, status, msg) {
                // shouldn't alert() anything, or it will interrup the iteration
                if (maxRetry-- > 0){
                    setTimeout(getTotalNum, lag);
                } else {
                    waitLoading.stop();
                    $('#' + target).show();
                }
            });  
        }
        setTimeout(getTotalNum,lag);
    }
}
