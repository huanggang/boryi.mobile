$(document).ready(function(){
  $('.ui-tab-item').click(function(){
    var tabname = $(this).addClass('ui-tab-item-current').attr('data-name');
    $('.ui-tab-item').not(this).removeClass('ui-tab-item-current');

    $('div.ui-tab-content').removeClass('ui-tab-content-current').filter(function(index){
      return tabname == $(this).attr('data-name');
    }).addClass('ui-tab-content-current');
  });
});