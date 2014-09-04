$(document).ready(function(){

  $('#more').click(function(){
    alert("more");
  });

  $('#complaint-btn').click(function(){
    if ($('.complaint-win').is(":visible")) {
      $('.complaint-win').hide("fast");
    }
    else {
      $('.complaint-win').show("slow");
    }
  });

});