var currentPage = 0;
var totalPage = 0;
var cityCache = {};
// cache the city lists so it won't send another request
var js_path = "js/";
$(document).ready(function() {

	setSelections(provinces, 'province', 10000);

	$.cachedScript = function(url, options) {
		// Allow user to set any option except for dataType, cache, and url
		options = $.extend(options || {}, {
			dataType : "script",
			cache : true,
			url : url,
			async : false,
		});
		return $.ajax(options);
	};

	// cache the city lists so it won't send another request
	$('#province').change(function(event) {
		var provinceid = $("#province option:selected").val();
		if (provinceid) {
			if (cityCache.hasOwnProperty(provinceid)) {
				setSelections(cityCache[provinceid], 'city');
			} else {
				setCities(provinceid);
			}
		}
	});

	setSelections(provinces, 'province', 10000);

	$.cachedScript = function(url, options) {
		// Allow user to set any option except for dataType, cache, and url
		options = $.extend(options || {}, {
			dataType : "script",
			cache : true,
			url : url,
			async : false,
		});
		return $.ajax(options);
	};

	$('#province').change(function(event) {
		var provinceid = $("#province option:selected").val();
		if (provinceid) {
			if (cityCache.hasOwnProperty(provinceid)) {
				setSelections(cityCache[provinceid], 'city');
			} else {
				setCities(provinceid);
			}
		}
	});

	$('#more').click(loadData);

	$('#search-btn').click(function() {
		currentPage = 0;
		loadData();
		$('.ui-tab-item')[1].click();
	});
});

/// assing options to the 'city' select input
///
///  provinceid - the id of the province
///  value      - the default city value
function setCities(provinceid, value, async) {
	if (provinceid == null) {
		return;
	}
	if (provinceid == 10000) {
		// no cities if all country has been selected
		setSelections([], 'city');
		return;
	}

	if (async == undefined) {
		async = true;
	}
	var url = js_path + 'city/cities_' + provinceid + '.js';
	$.cachedScript(url, {
		async : async
	}).done(function(data, textStatus) {
		var cities = eval('cities_' + provinceid);
		cityCache[provinceid] = cities;
		setSelections(cities, 'city');
	});
}

/// assing options to a select input
///
///  json   - the json string
///  target - id of the select input
///  value  - the default value
function setSelections(json, target, value) {
	var len = json.length;
	if (len == 0) {
		$('#' + target).hide();
	} else {
		$('#' + target).show();
	}
	$('#' + target).empty();
	//.append('<option value="-1">-</option>');
	for (var j = 0; j < len; j++) {
		var op = $('<option/>');
		op.attr('value', json[j].id);
		// fixed typo
		if (value != undefined && value == json[j].id) {
			op.attr('selected', 'selected');
		}
		op.append(json[j].name);
		$('#' + target).append(op);
	}
}

/// assing options to the 'city' select input
///
///  provinceid - the id of the province
///  value      - the default city value
function setCities(provinceid, value, async) {
	if (provinceid == null) {
		return;
	}
	if (provinceid == 10000) {
		// no cities if all country has been selected
		setSelections([], 'city');
		return;
	}

	if (async == undefined) {
		async = true;
	}
	var url = js_path + '/city/cities_' + provinceid + '.js';
	$.cachedScript(url, {
		async : async
	}).done(function(data, textStatus) {
		var cities = eval('cities_' + provinceid);
		cityCache[provinceid] = cities;
		setSelections(cities, 'city');
	});
}

///assing options to a select input
///json   - the json string
///target - id of the select input
///value  - the default value
function setSelections(json, target, value) {
	var len = json.length;
	if (len == 0) {
		$('#' + target).hide();
	} else {
		$('#' + target).show();
	}
	$('#' + target).empty();
	//.append('<option value="-1">-</option>');

	for (var j = 0; j < len; j++) {
		var op = $('<option/>');
		op.attr('value', json[j].id);
		// fixed typo

		if (value != undefined && value == json[j].id) {
			op.attr('selected', 'selected');
		}
		op.append(json[j].name);
		$('#' + target).append(op);
	}
}

function loadData() {
	$('#more').hide();

	var d;
	if (currentPage == 0) {
		$('.list').empty();
		d = {
			s1 : getWorkPlace(),
			s2 : $('#cmp-type').val()
		};
	} else {
		d = {
			p : currentPage + 1,
			q : $('#search-btn').data('q')
		};
	}
	$.ajax({
		type : 'get',
		url : 'http://www.boryi.com:8080/SearchJobs1/jobs',
		data : d,
		dataType : 'jsonp',
		success : function(json) {
			showJobs(json);
		},
		error : function() {
			alert('error');
		}
	});

}

function showJobs(json) {

	var jobs = json['j'];
	if (!jobs) {
		$('#more').hide();
		return;
	}
	var ul = $('.list');
	if (currentPage == 0) {
		if (json['t']) {
			totalPage = Math.floor((json['t'] + 19) / 20);
		} else {
			totalPage = 20;
		}

		$('#search-btn').data('q', json['q']);
	}

	if (++currentPage < totalPage) {
		$('#more').show();
	} else {
		$('#more').hide();
	}

	for (var i = 0; i < jobs.length; i++) {
		var li = $('<li class="list-item"></li>');
		var div = $('<div class="list-title fb" onclick="showJobDetail(this)"></div>').text(jobs[i]['t']);
		div.data('u', jobs[i]['u']);
		li.append($('<div></div>').append(div));
		div = $('<div class="fc fb"></div>');
		div.append('<div class="fl fb w55">' + getLocation(jobs[i]['l']) + '</div>');
		//location
		div.append('<div class="fr">' + jobs[i]['p'] + '</div>');
		//date
		div.append('<div class="fr mgr10">' + getJobTypeName(jobs[i]['e']) + '</div>');
		//type
		li.append(div);
		li.append('<div class="fc"></div>');
		ul.append(li);
	}
}

function getJobTypeName(code) {
	switch(code) {
		case 1:
			return '公务员';
		case 2:
			return '事业编';
		default:
			return '其他';
	}
}

function showJobDetail(ele) {
	var url = $(ele).data('u');
	$('.src-btn').data('u', url);
	$('.ui-tab-item')[2].click();
	$('iframe').attr("src", url);
}

function goToSrcSite(ele) {
	if ($(ele).data('u')){
		window.open($(ele).data('u'));
	}else{
	
	}
}

function getLocation(code) {
	code += '';
	code = code.substring(0, code.length - 11);
	if (code == '10000') {
		return '全国';
	} else {
		var province = parseInt(code.substr(1, 2) * 100);
		var city = parseInt(code.substr(1, 4));
		if (province == city || cityCache[province] == undefined) {
			return map_id_attr(provinces, province, 'name');
		} else {
			return map_id_attr(provinces, province, 'name') + '-' + map_id_attr(cityCache[province], city, 'name');
		}
	}
}

/// get the workplace according to the country, province and city
function getWorkPlace() {
	var city = $("#city option:selected").val();
	if (city == undefined) {
		city = '';
	}
	if (city.length > 0) {
		return '1' + city + '00000000000';
	} else {
		var province = $("#province option:selected").val();
		if (province.length == 5) {
			return '1000000000000000';
		} else {
			return '1' + province + '00000000000';
		}
	}
}