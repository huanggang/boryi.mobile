<?php

include_once 'util_global.php';
include_once 'util_data.php';

$openid = isset($_POST["oi"]) ? $_POST["oi"] : null;
if (is_null($openid))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$ids = isset($_POST["s"]) ? $_POST["s"] : null;

$con=mysqli_connect($db_host, $db_user, $db_pwd, $db_name);
// Check connection
if (mysqli_connect_errno())
{
  echo "{\"result\":0,\"error\":".$errors["db connection failure"]."}";
  exit;
}
mysqli_set_charset($con, "UTF8");

$total = 0;
$communities = "";
$json = null;

$l_latitude = null;
$l_longitude = null;

//mysqli_query($con, "LOCK TABLES login_l READ, nearby_communities_nc READ, nearby_community_info_nc READ");
// check if user is online with location info
$query_1 = "SELECT l_latitude, l_longitude FROM login_l WHERE l_openid=".sqlstr($openid);
$result = mysqli_query($con, $query_1);
if ($row = mysqli_fetch_array($result))
{
  $l_latitude = $row['l_latitude'];
  $l_longitude = $row['l_longitude'];
  mysqli_free_result($result);
}
if (is_null($l_latitude) || is_null($l_longitude))
{
  $json = "{\"result\":0,\"error\":".$errors["login location missed"]."}";
}

if (is_null($json))
{
  $nc_ids = array();
  if (is_null($ids)) // first page query
  {
    $total = 0;
    $distance = $distance_min;
    $max_total = $max_pages * $per_page;
    while ($total < $per_page && $distance <= $distance_max)
    {
      $number = $max_total - $total;
      $query_1 = get_geo_distance_query('nearby_communities_nc', 'nc_id,nc_lat,nc_lng', 'nc_lat', 'nc_lng', $l_latitude, $l_longitude, null, $distance, $number);
    
      $total = 0;
      $nc_ids = array();
      $result = mysqli_query($con, $query_1);
      while ($row = mysqli_fetch_array($result))
      {
        $nc_id = $row['nc_id'];
        $nc_lat = $row['nc_lat'];
        $nc_lng = $row['nc_lng'];
        $nc_dist = $row['distance'];

        $id = array(intval($nc_id), floatval($nc_lat), floatval($nc_lng), floatval($nc_dist));
        $nc_ids[$total] = $id;

        $total++;
      }
      mysqli_free_result($result);

      $distance += $distance_step;
    }
  }
  else // $ids is not null
  {
    $nc_ids_ = explode(",", $ids);
    $length = sizeof($nc_ids_);
    if ($length > $per_page)
    {
      $length = $per_page;
    }
    for($i = 0; $i < $length; $i++)
    {
      $nc_ids[$i] = array(intval($nc_ids_[$i]), null, null, null);
    }
  }

  $length = sizeof($nc_ids);
  if ($length > $per_page)
  {
    $length = $per_page;
  }
  for ($i = 0; $i < $length; $i++) // get community-detail information
  {
    $query_2 = "SELECT nc_name, nc_total_area, nc_total_house_area, nc_house_ratio, nc_plant_ratio, nc_sale_date, nc_finished_date FROM nearby_community_info_nc WHERE nc_id=".sqlstrval($nc_ids[$i][0]);
    $result = mysqli_query($con, $query_2);
    if ($row = mysqli_fetch_array($result))
    {
      $nc_name = $row['nc_name'];
      $nc_total_area = $row['nc_total_area'];
      $nc_total_house_area = $row['nc_total_house_area'];
      $nc_house_ratio = $row['nc_house_ratio'];
      $nc_plant_ratio = $row['nc_plant_ratio'];
      $nc_sale_date = $row['nc_sale_date'];
      $nc_finished_date = $row['nc_finished_date'];
      mysqli_free_result($result);

      $communities = $communities.",{\"i\":".jsonstrval($nc_ids[$i][0]).",\"lat\":".jsonstrval($nc_ids[$i][1]).",\"lng\":".jsonstrval($nc_ids[$i][2]).",\"d\":".jsonstrval($nc_ids[$i][3]).",\"n\":".jsonstr($nc_name).",\"ta\":".jsonstrval($nc_total_area).",\"ha\":".jsonstrval($nc_total_house_area).",\"hr\":".jsonstrval($nc_house_ratio).",\"pr\":".jsonstrval($nc_plant_ratio).",\"sd\":".jsonstr($nc_sale_date).",\"fd\":".jsonstr($nc_finished_date)."}";
    }
  }

  for ($i = $length; $i < sizeof($nc_ids); $i++)
  {
    $communities = $communities.",{\"i\":".jsonstrval($nc_ids[$i][0]).",\"lat\":".jsonstrval($nc_ids[$i][1]).",\"lng\":".jsonstrval($nc_ids[$i][2]).",\"d\":".jsonstrval($nc_ids[$i][3])."}";
  }
  $communities = substr($communities, 1);

  $json = "{\"lat\":".jsonstrval($l_latitude).",\"lng\":".jsonstrval($l_longitude).",\"t\":".$total.",\"c\":[".$communities."]}";
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;

?>