function map_click(target){
  // 百度地图API功能
  var map = null;

  $("#golist").click(function(event){
    if ($("#allmap").is(":visible")){
      $(this).text("显示地图");
      $("#allmap").hide();
    }
    else{
      $(this).text("关闭地图");
      $("#allmap").show();
      if (map == null){
        if (target != null){
          $.ajax({
              url: "http://api.map.baidu.com/geoconv/v1/?ak=B80e31da09924630b63f8aeb4d07218f&from=3&to=5&coords=" + target.lng + "," + target.lat,
              dataType: "jsonp", 
              jsonpCallback: "_gps", 
              cache: true,
              timeout: 60000, 
          }).done(function(d) {
            if (d.status != null && d.status == 0) {
              var result = d.result[0];

              map = new BMap.Map("allmap");
              map.centerAndZoom(new BMap.Point(result.x, result.y), 16);

              map.addControl(new BMap.ZoomControl());  //添加地图缩放控件
              var marker1 = new BMap.Marker(new BMap.Point(result.x, result.y));  //创建标注
              map.addOverlay(marker1);                 // 将标注添加到地图中
              //创建信息窗口
              if (target.add != null){
                var infoWindow1 = new BMap.InfoWindow(target.add);
                marker1.addEventListener("click", function(){this.openInfoWindow(infoWindow1);});
              }
            }
          });
        }
      }
    }
  });
}