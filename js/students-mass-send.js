$(document).ready(function(){
	var postInfo = function(form){ 
		var targetUrl = "http://m.boryi.com/php/wx/action.php?send=1";
		var info = {
		    key: $("#key").val(),
		}

		$.ajax({
		  url: targetUrl,
		  type: 'POST',
		  data: JSON.stringify(info),
		  contentType: 'application/json',
		  processData:false
		}).done(function(d) {
		  alert('发送成功!');
		  //window.location.href = home;
		}).fail(function(xhr, status, msg) {
		  alert('网络出现问题，请刷新页面。');
		});
	}

	var validator = $("form").validate({
	    errorPlacement: function(error, element) {
	    	element.parent().append(error); // default function
	    }, 
	    submitHandler: postInfo,
		rules: { 
	  	}, 
	  	messages: { 
	  	},
  	});
  	
});