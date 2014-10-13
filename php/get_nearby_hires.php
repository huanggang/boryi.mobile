<?php

include_once 'util_global.php';
include_once 'util_data.php';

$openid = $_POST["oi"];
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
$hires = "";
$json = null;

$l_latitude = null;
$l_longitude = null;

//mysqli_query($con, "LOCK TABLES login_l READ, nearby_hires_nh READ, nearby_hire_info_nh READ");
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
  $nh_ids = array();
  if (is_null($ids)) // first page query
  {
    $total = 0;
    $distance = $distance_min;
    while ($total < $per_page && $distance <= $distance_max)
    {
      $number = $distance > $distance_min ? $per_page : null;
      $query_1 = get_geo_distance_query('nearby_hires_nh', 'nh_id,nh_lat,nh_lng', 'nh_lat', 'nh_lng', $l_latitude, $l_longitude, $distance, $number);
    
      $total = 0;
      $nh_ids = array();
      $result = mysqli_query($con, $query_1);
      while ($row = mysqli_fetch_array($result))
      {
        $nh_id = $row['nh_id'];
        $nh_lat = $row['nh_lat'];
        $nh_lng = $row['nh_lng'];
        $nh_dist = $row['distance'];

        $id = array(intval($nh_id), floatval($nh_lat), floatval($nh_lng), floatval($nh_dist));
        $nh_ids[$total] = $id;

        $total++;
      }
      mysqli_free_result($result);

      if ($distance > $distance_min && $total > $per_page)
      {
        $total = $per_page;
      }
      $distance += $distance_step;
    }
  }
  else // $ids is not null
  {
    $nh_ids_ = explode(",", $ids);
    $length = sizeof($nh_ids_);
    if ($length > $per_page)
    {
      $length = $per_page;
    }
    for($i = 0; $i < $length; $i++)
    {
      $nh_ids[$i] = array(intval($nh_ids_[$i]), null, null, null);
    }
  }

  $length = sizeof($nh_ids);
  if ($length > $per_page)
  {
    $length = $per_page;
  }
  for ($i = 0; $i < $length; $i++) // get hire-detail information
  {
    $query_2 = "SELECT nh_start, nh_titles, nh_location, nh_duration, nh_contact FROM nearby_hire_info_nh WHERE nh_id=".sqlstrval($nh_ids[$i][0]);
    $result = mysqli_query($con, $query_2);
    if ($row = mysqli_fetch_array($result))
    {
      $nh_start = $row['nh_start'];
      $nh_titles = $row['nh_titles'];
      $nh_location = $row['nh_location'];
      $nh_duration = $row['nh_duration'];
      $nh_contact = $row['nh_contact'];
      mysqli_free_result($result);

      $hires = $hires.",{\"i\":".jsonstrval($nh_ids[$i][0]).",\"lat\":".jsonstrval($nh_ids[$i][1]).",\"lng\":".jsonstrval($nh_ids[$i][2]).",\"d\":".jsonstrval($nh_ids[$i][3]).",\"s\":".jsonstr($nh_start).",\"t\":".jsonstr($nh_titles).",\"l\":".jsonstr($nh_location).",\"dr\":".jsonstrval($nh_duration).",\"c\":".jsonstr($nh_contact)."}";
    }
  }

  for ($i = $length; $i < sizeof($nh_ids); $i++)
  {
    $hires = $hires.",{\"i\":".jsonstrval($nh_ids[$i][0]).",\"lat\":".jsonstrval($nh_ids[$i][1]).",\"lng\":".jsonstrval($$nh_ids[$i][2]).",\"d\":".jsonstrval($nh_ids[$i][3])."}";
  }
  $hires = substr($hires, 1);
  
  $json = "{\"lat\":".jsonstrval($l_latitude).",\"lng\":".jsonstrval($l_longitude).",\"t\":".$total.",\"h\":[".$hires."]}";
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;

?>