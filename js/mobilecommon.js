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

/// get json 'name' property according to 'id' property
function map_id_name(jsons, id){
	for (var i = 0; i < jsons.length; i++){
		var j = jsons[i];
		if (j.id == id) {
			return j.nm;
		}
	}
	return '';
};

/// get the value of the selected option
function getSelected(select){
	return $("#" + select + " option:selected").val();
}