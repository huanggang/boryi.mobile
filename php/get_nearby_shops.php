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
$keyword = isset($_POST["k"]) ? trim($_POST["k"]) : null;
if (strlen($keyword) == 0) 
{
  $keyword = null;
}
$restroom = isset($_POST['rt']) ? format_boolean(str2int($_POST['rt'])) : false;
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
$shops = "";
$json = null;

$l_latitude = null;
$l_longitude = null;

//mysqli_query($con, "LOCK TABLES login_l READ, nearby_shops_ns READ, nearby_shop_info_ns READ");
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
  $ns_ids = array();
  if (is_null($ids)) // first page query
  {
    $total = 0;
    $distance = $distance_min;
    $max_total = $max_pages * $per_page;
    $conditions = format_conditions($cat_id, $keyword, $restroom);
    while ($total < $per_page && $distance <= $distance_max)
    {
      $number = $max_total - $total;
      $query_1 = get_geo_distance_query('nearby_shops_ns', 'ns_id,ns_lat,ns_lng,ns_shp_cat_id,ns_name,ns_restroom', 'ns_lat', 'ns_lng', $l_latitude, $l_longitude, $conditions, $distance, $number);
    
      $total = 0;
      $ns_ids = array();
      $result = mysqli_query($con, $query_1);
      while ($row = mysqli_fetch_array($result))
      {
        $ns_id = $row['ns_id'];
        $ns_lat = $row['ns_lat'];
        $ns_lng = $row['ns_lng'];
        $ns_dist = $row['distance'];
        $ns_shp_cat_id = $row['ns_shp_cat_id'];
        $ns_name = $row['ns_name'];
        $ns_restroom = $row['ns_restroom'];

        $id = array(intval($ns_id), floatval($ns_lat), floatval($ns_lng), floatval($ns_dist), intval($ns_shp_cat_id), $ns_name, intval($ns_restroom));
        $ns_ids[$total] = $id;

        $total++;
      }
      mysqli_free_result($result);

      $distance += $distance_step;
    }
  }
  else // $ids is not null
  {
    $ns_ids_ = explode(",", $ids);
    $length = sizeof($ns_ids_);
    if ($length > $per_page)
    {
      $length = $per_page;
    }
    for($i = 0; $i < $length; $i++)
    {
      $ns_ids[$i] = array(intval($ns_ids_[$i]), null, null, null, null, null, null);
    }
  }

  $length = sizeof($ns_ids);
  if ($length > $per_page)
  {
    $length = $per_page;
  }
  for ($i = 0; $i < $length; $i++) // get shop-detail information
  {
    $query_2 = "SELECT ns_shp_att_ids, ns_star_5, ns_star_4, ns_star_3, ns_star_2, ns_star_1 FROM nearby_shop_info_ns WHERE ns_id=".sqlstrval($ns_ids[$i][0]);
    $result = mysqli_query($con, $query_2);
    if ($row = mysqli_fetch_array($result))
    {
      $ns_shp_att_ids = $row['ns_shp_att_ids'];
      $ns_star_5 = $row['ns_star_5'];
      $ns_star_4 = $row['ns_star_4'];
      $ns_star_3 = $row['ns_star_3'];
      $ns_star_2 = $row['ns_star_2'];
      $ns_star_1 = $row['ns_star_1'];
      mysqli_free_result($result);

      $shops = $shops.",{\"i\":".jsonstrval($ns_ids[$i][0]).",\"lat\":".jsonstrval($ns_ids[$i][1]).",\"lng\":".jsonstrval($ns_ids[$i][2]).",\"d\":".jsonstrval($ns_ids[$i][3]).",\"c\":".jsonstrval($ns_ids[$i][4]).",\"n\":".jsonstr($ns_ids[$i][5]).",\"r\":".jsonstrval($ns_ids[$i][6]).",\"a\":".jsonstr($ns_shp_att_ids).",\"s5\":".jsonstrval($ns_star_5).",\"s4\":".jsonstrval($ns_star_4).",\"s3\":".jsonstrval($ns_star_3).",\"s2\":".jsonstrval($ns_star_2).",\"s1\":".jsonstrval($ns_star_1)."}";
    }
  }

  for ($i = $length; $i < sizeof($ns_ids); $i++)
  {
    $shops = $shops.",{\"i\":".jsonstrval($ns_ids[$i][0]).",\"lat\":".jsonstrval($ns_ids[$i][1]).",\"lng\":".jsonstrval($ns_ids[$i][2]).",\"d\":".jsonstrval($ns_ids[$i][3]).",\"c\":".jsonstrval($ns_ids[$i][4]).",\"n\":".jsonstr($ns_ids[$i][5]).",\"r\":".jsonstrval($ns_ids[$i][6])."}";
  }
  $shops = substr($shops, 1);

  $json = "{\"lat\":".jsonstrval($l_latitude).",\"lng\":".jsonstrval($l_longitude).",\"t\":".$total.",\"s\":[".$shops."]}";
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;


function format_conditions($cat_id, $keyword, $restroom)
{
  $conditions = "";
  if ($cat_id > 0)
  {
    $cat_level = get_cat_level($cat_id);
    $conditions = $conditions . " AND ns_shp_cat_id ";
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
  if (!is_null($keyword) && strlen($keyword) > 0)
  {
    $str = "";
    $keywords = preg_split("/[^0-9a-z\x{4e00}-\x{9fa5}]+/iu", $keyword);
    for ($i = 0; $i < sizeof($keywords) && $i < 3; $i++)
    {
      $str = $str . " OR ns_name LIKE '%".$keywords[$i]."%'";
    }
    if (strlen($str) > 0)
    {
      $str = substr($str, 4);
      $conditions = $conditions . " AND (" . $str . ")";
    }
  }
  if ($restroom)
  {
    $conditions = $conditions . " AND ns_restroom = 1";
  }
  if (strlen($conditions) > 0)
  {
    return $conditions;
  }
  return null;
}

function format_boolean($value)
{
  if ($value < 0)
  {
    return null;
  }
  else if ($value > 0)
  {
    return 1;
  }
  return 0;
}

?>