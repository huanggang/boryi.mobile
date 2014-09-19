var currentPage = 0;
var totalPage = 0;
var cityCache = {};
var lastViewedJid;
var tout = 15000;
var loading = false;
var detailTabClickable = false;
// the default timeout value
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
				setCitiesByProvinceId(provinceid, 'city');
			}
		}
	});

	$('#more').click(loadData);

	$('#search-btn').click(function() {
		$('.ui-tab-item:gt(0)').unbind('click');
		$('.ui-tab-item:lt(2)').click(tabHandler);
		currentPage = 0;
		totalPage = 0;
		loading = false;
		loadData();
		lastViewedJid = null;
		$('.ui-tab-item').first().next().click(function() {
			if (lastViewedJid) {
				view(lastViewedJid);
			}
		}).click();
	});
});

function loadData() {
	if (loading) {
		return;
	}
	loading = true;
	$('#more').html('数据加载中...');
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
			loading = false;
			showJobs(json);
			checkTotal(json);
		},
		error : function() {
			loading = false;
			alert('网络错误,请重试');
		}
	});

}

function showJobs(json) {
	var jobs = json['j'];
	var ul = $('.list');

	for (var i = 0; i < jobs.length; i++) {
		var li = $('<li class="list-item" onclick="showJobDetail(this)" id="job' + ((currentPage - 1) * 20 + i) + '"></li>');
		var div = $('<div class="list-title fb"></div>').text(jobs[i]['t']);
		li.data('u', jobs[i]['u']);
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
	if (!lastViewedJid) {
		$('.ui-tab-item:last').click(tabHandler);
	}
	var url = $(ele).addClass('viewed').data('u');

	lastViewedJid = $(ele).attr('id');
	$('.src-btn').data('u', url);
	$('.ui-tab-item')[2].click();
	$('iframe').attr("src", url);
}

function goToSrcSite(ele) {
	if ($(ele).data('u')) {
		window.open($(ele).data('u'));
	} else {

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
			var city = map_id_attr(cityCache[province], city, 'name');
			if (city && city.length > 0) {
				city = '-' + city;
			}
			return map_id_attr(provinces, province, 'name') + city;
		}
	}
}

/// get the workplace according to the country, province and city
function getWorkPlace() {
	var city = $("#city option:selected").val();
	if (city == undefined || '-1' == city) {
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

function checkTotal(json) {

	var jobs = json['j'];

	if (currentPage == 0) {
		if (json['t']) {
			totalPage = Math.floor((json['t'] + 19) / 20);
		}
		$('#search-btn').data('q', json['q']);
	}

	if (++currentPage < totalPage && currentPage <= 20) {
		$('#more').html('显示更多结果...').show();
	} else {
		$('#more').hide();
	}

	if (currentPage > 1) {
		return;
	}

	if (jobs.length == 20 && !json['t']) {
		// probably has more than 20 items, try to collect the total
		$('#more').html('更多结果正在查询中...');

		var maxRetry = 3;
		var targetUrl = 'http://www.boryi.com:8080/SearchJobs1/total?s1=' + getWorkPlace() + '&s2=' + $('#cmp-type').val();
		loading = true;
		var getTotalNum = function() {
			console.log('start to query t...');
			$.ajax({
				url : targetUrl,
				dataType : "jsonp",
				jsonpCallback : "_ttl" + Date.now(),
				cache : true,
				timeout : tout,
			}).done(function(d) {
				loading = false;
				if (d.t > 0) {
					totalPage = Math.floor((d['t'] + 19) / 20);
					$('#more').html('显示更多结果...');
				}
			}).fail(function(xhr, status, msg) {
				loading = false;
				// shouldn't alert() anything, or it will interrup the iteration
				console.log('failed to get t, retrying...' + maxRetry);
				if (maxRetry-- > 0) {
					setTimeout(getTotalNum, 5000);
				} else {
					$('#more').html('显示更多结果...');
				}
			});
		}
		getTotalNum();
	}
}
