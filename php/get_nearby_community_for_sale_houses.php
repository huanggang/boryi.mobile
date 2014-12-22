<?php

include_once 'util_global.php';
include_once 'util_data.php';

$openid = isset($_POST["oi"]) ? $_POST["oi"] : null;
if (is_null($openid))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$community_id = isset($_POST["c"]) ? str2int($_POST["c"]) : 0;
if ($community_id < 1)
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$type = isset($_POST["t"]) ? $_POST["t"] : null;
if (is_null($type))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}

$con=mysqli_connect($db_host, $db_user, $db_pwd, $db_name);
// Check connection
if (mysqli_connect_errno())
{
  echo "{\"result\":0,\"error\":".$errors["db connection failure"]."}";
  exit;
}
mysqli_set_charset($con, "UTF8");

$json = "{\"result\":0,\"error\":".$errors["not found"]."}";

$credit = 0;
//mysqli_query($con, "LOCK TABLES user_credits_ucr READ, nearby_community_buildings_ncb READ, nearby_community_building_houses_ncbh READ");
$query_1 = "SELECT ucr_credit FROM user_credits_ucr WHERE ucr_openid=".sqlstr($openid);
$result = mysqli_query($con, $query_1);
if ($row = mysqli_fetch_array($result))
{
  $credit = $row['ucr_credit'];
  mysqli_free_result($result);
}

$bldgs = array();
$query_1 = "SELECT ncb_id, ncb_name FROM nearby_community_buildings_ncb WHERE ncb_nc_id=".sqlstrval($community_id);
$result = mysqli_query($con, $query_1);
while ($row = mysqli_fetch_array($result))
{
  $ncb_id = $row['ncb_id'];
  $ncb_name = $row['ncb_name'];

  $bldgs[$ncb_id] = $ncb_name;
}
mysqli_free_result($result);

$buildings = "";
$total_houses = 0;

$floors = "";
$total_building_houses = 0;
$current_building = null;

$total_floor_houses = 0;
$houses="";
$current_floor = null;

$query_1 = "SELECT ncbh_ncb_id, ncbh_floor, ncbh_house, ncbh_outer_area, ncbh_inner_area, ncbh_asking_price FROM nearby_community_building_houses_ncbh WHERE ncbh_nc_id=".sqlstrval($community_id)." AND ncbh_status=0 AND ncbh_type=".sqlstr($type)." ORDER BY ncbh_ncb_id, ncbh_floor, ncbh_house";
$result = mysqli_query($con, $query_1);
while ($row = mysqli_fetch_array($result))
{
  $total_houses++;

  $ncbh_ncb_id = $row['ncbh_ncb_id'];
  $ncbh_floor = $row['ncbh_floor'];
  $ncbh_house = $row['ncbh_house'];
  $ncbh_outer_area = $row['ncbh_outer_area'];
  $ncbh_inner_area = $row['ncbh_inner_area'];
  if ($credit >= 50)
  {
    $ncbh_asking_price = $row['ncbh_asking_price'];
  }
  else
  {
    $ncbh_asking_price = null;
  }
  if ($current_building != $ncbh_ncb_id)
  {
    if (!is_null($current_building))
    {
      $houses = substr($houses, 1);
      $floors = $floors.",{\"f\":".jsonstrval($current_floor).",\"t\":".jsonstrval($total_floor_houses).",\"hs\":[".$houses."]}";

      $total_floor_houses = 0;
      $houses = "";

      $floors = substr($floors, 1);
      $buildings = $buildings.",{\"b\":".jsonstr($bldgs[$current_building]).",\"t\":".jsonstrval($total_building_houses).",\"fs\":[".$floors."]}";

      $total_building_houses = 0;
      $floors = "";
    }
    $current_floor = $ncbh_floor;
    $current_building = $ncbh_ncb_id;
  }
  else
  {
    if ($current_floor != $ncbh_floor)
    {
      if (!is_null($current_floor))
      {
        $houses = substr($houses, 1);
        $floors = $floors.",{\"f\":".jsonstrval($current_floor).",\"t\":".jsonstrval($total_floor_houses).",\"hs\":[".$houses."]}";

        $total_floor_houses = 0;
        $houses = "";
      }
      $current_floor = $ncbh_floor;
    }
  }
  $total_floor_houses++;
  $total_building_houses++;
  $houses = $houses.",{\"h\":".jsonstr($ncbh_house).",\"oa\":".jsonstrval($ncbh_outer_area).",\"ia\":".jsonstrval($ncbh_inner_area).",\"t\":".jsonstr($type).",\"s\":0,\"ap\":".jsonstrval($ncbh_asking_price).",\"sp\":".jsonstrval($ncbh_sold_price).",\"sd\":".jsonstr($ncbh_sold_date)."}";
}
mysqli_free_result($result);
//mysqli_query($con, "UNLOCK TABLES");

$houses = substr($houses, 1);
$floors = $floors.",{\"f\":".jsonstrval($current_floor).",\"t\":".jsonstrval($total_floor_houses).",\"hs\":[".$houses."]}";
$floors = substr($floors, 1);
$buildings = $buildings.",{\"b\":".jsonstr($bldgs[$current_building]).",\"t\":".jsonstrval($total_building_houses).",\"fs\":[".$floors."]}";
$buildings = substr($buildings, 1);
$json = "{\"cr\":".jsonstrval($credit).",\"t\":".jsonstrval($total_houses).",\"bs\":[".$buildings."]}";

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;

?>