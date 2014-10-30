<?php

include_once 'util_global.php';
include_once 'util_data.php';

$openid = isset($_POST["oi"]) ? $_POST["oi"] : null;
if (is_null($openid))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$cat_id = isset($_POST["ci"]) ? str2int($_POST["ci"]) : 0;
if ($cat_id <= 0)
{
  $cat_id = null;
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
$news = "";
$json = null;

$l_latitude = null;
$l_longitude = null;

//mysqli_query($con, "LOCK TABLES login_l READ, nearby_news_nn READ, nearby_news_info_nn READ");
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
  $nn_ids = array();
  if (is_null($ids)) // first page query
  {
    $total = 0;
    $distance = $distance_min;
    $max_total = $max_pages * $per_page;
    $conditions = format_conditions($cat_id);
    while ($total < $per_page && $distance <= $distance_max)
    {
      $number = $max_total - $total;
      $query_1 = get_geo_distance_query('nearby_news_nn', 'nn_id,nn_lat,nn_lng,nn_nws_cat_id', 'nn_lat', 'nn_lng', $l_latitude, $l_longitude, $conditions, $distance, $number);
    
      $total = 0;
      $nn_ids = array();
      $result = mysqli_query($con, $query_1);
      while ($row = mysqli_fetch_array($result))
      {
        $nn_id = $row['nn_id'];
        $nn_lat = $row['nn_lat'];
        $nn_lng = $row['nn_lng'];
        $nn_dist = $row['distance'];
        $nn_nws_cat_id = $row['nn_nws_cat_id'];

        $id = array(intval($nn_id), floatval($nn_lat), floatval($nn_lng), floatval($nn_dist), intval($nn_nws_cat_id));
        $nn_ids[$total] = $id;

        $total++;
      }
      mysqli_free_result($result);

      $distance += $distance_step;
    }
  }
  else // $ids is not null
  {
    $nn_ids_ = explode(",", $ids);
    $length = sizeof($nn_ids_);
    if ($length > $per_page)
    {
      $length = $per_page;
    }
    for($i = 0; $i < $length; $i++)
    {
      $nn_ids[$i] = array(intval($nn_ids_[$i]), null, null, null, null, null, null);
    }
  }

  $length = sizeof($nn_ids);
  if ($length > $per_page)
  {
    $length = $per_page;
  }
  for ($i = 0; $i < $length; $i++) // get news-detail information
  {
    $query_2 = "SELECT nn_start, nn_end, nn_title FROM nearby_news_info_nn WHERE nn_id=".sqlstrval($nn_ids[$i][0]);
    $result = mysqli_query($con, $query_2);
    if ($row = mysqli_fetch_array($result))
    {
      $nn_start = $row['nn_start'];
      $nn_end = $row['nn_end'];
      $nn_title = $row['nn_title'];
      mysqli_free_result($result);

      $news = $news.",{\"i\":".jsonstrval($nn_ids[$i][0]).",\"lat\":".jsonstrval($nn_ids[$i][1]).",\"lng\":".jsonstrval($nn_ids[$i][2]).",\"d\":".jsonstrval($nn_ids[$i][3]).",\"c\":".jsonstrval($nn_ids[$i][4]).",\"t\":".jsonstr($nn_title).",\"s\":".jsonstr($nn_start).",\"e\":".jsonstr($nn_end)."}";
    }
  }

  for ($i = $length; $i < sizeof($nn_ids); $i++)
  {
    $news = $news.",{\"i\":".jsonstrval($nn_ids[$i][0]).",\"lat\":".jsonstrval($nn_ids[$i][1]).",\"lng\":".jsonstrval($nn_ids[$i][2]).",\"d\":".jsonstrval($nn_ids[$i][3]).",\"c\":".jsonstrval($nn_ids[$i][4])."}";
  }
  $news = substr($news, 1);

  $json = "{\"lat\":".jsonstrval($l_latitude).",\"lng\":".jsonstrval($l_longitude).",\"t\":".$total.",\"n\":[".$news."]}";
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;


function format_conditions($cat_id)
{
  $conditions = "";
  if (!is_null($cat_id) && $cat_id > 0)
  {
    $cat_level = get_cat_level($cat_id);
    $conditions = $conditions . " AND nn_nws_cat_id ";
    switch ($cat_level)
    {
      case 3:
        $conditions = $conditions . " = " . intval($cat_id);
        break;
      case 2:
        $conditions = $conditions . " BETWEEN " . intval($cat_id) . " AND " . intval($cat_id + 99);
        break;
      case 1:
        $conditions = $conditions . " BETWEEN " . intval($cat_id) . " AND " . intval($cat_id + 9999);
        break;
    }
  }
  if (strlen($conditions) > 0)
  {
    return $conditions;
  }
  return null;
}

?>