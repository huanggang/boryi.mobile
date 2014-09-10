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
	range = range || [];
	if (range.length == 2){
	  if (range[0] == null && range[1] > 0){
	    return range[1] + highstr;
	  } else if (range[0] > 0 && range[1] == null){
	    return range[0] + lowstr;
	  } else if (range[0] > 0 && range[1] > 0){
	    return range[0] + range_concat + range[1] + unit;
	  } 
	}
	return result;
}