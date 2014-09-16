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
                var top = $('#' + id).offset().top;
                if (top){
                        $('html, body').animate({
                        scrollTop: top
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

    getSetCityFunction()(provinceid,target,async);

}

function getSetCityFunction(){
    var cityCache = {};
    return function (provinceid,target,async){
        
        if(cityCache.hasOwnProperty(provinceid)){
            setSelections(cityCache[provinceid], target);
        }
        else{
            var url = 'js/city/cities_' + provinceid + '.js';
            console.log(url);
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
