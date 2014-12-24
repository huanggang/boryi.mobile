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
$building_id = isset($_POST["b"]) ? str2int($_POST["b"]) : 0;
if ($building_id < 1)
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

$credit = 0;
//mysqli_query($con, "LOCK TABLES user_credits_ucr READ, nearby_community_building_houses_ncbh READ");
$query_1 = "SELECT ucr_credit FROM user_credits_ucr WHERE ucr_openid=".sqlstr($openid);
$result = mysqli_query($con, $query_1);
if ($row = mysqli_fetch_array($result))
{
  $credit = $row['ucr_credit'];
  mysqli_free_result($result);
}

$floors = "";
$total_houses = 0;

$total_floor_houses = 0;
$houses="";
$current_floor = null;

$query_1 = "SELECT ncbh_floor, ncbh_house, ncbh_outer_area, ncbh_inner_area, ncbh_type, ncbh_status, ncbh_asking_price, ncbh_sold_price, ncbh_sold_date FROM nearby_community_building_houses_ncbh WHERE ncbh_nc_id=".sqlstrval($community_id)." AND ncbh_ncb_id=".sqlstrval($building_id)." ORDER BY ncbh_floor, ncbh_house";
$result = mysqli_query($con, $query_1);
while ($row = mysqli_fetch_array($result))
{
  $total_houses++;

  $ncbh_floor = $row['ncbh_floor'];
  $ncbh_house = $row['ncbh_house'];
  $ncbh_outer_area = $row['ncbh_outer_area'];
  $ncbh_inner_area = $row['ncbh_inner_area'];
  $ncbh_type = $row['ncbh_type'];
  $ncbh_status = $row['ncbh_status'];
  if ($credit >= 50)
  {
    $ncbh_asking_price = $row['ncbh_asking_price'];
    $ncbh_sold_price = $row['ncbh_sold_price'];
    $ncbh_sold_date = $row['ncbh_sold_date'];
    $date1 = new DateTime($ncbh_sold_date);
    $date2 = new DateTime("2014-12-20");
    if ($date1 < $date2)
    {
      $ncbh_sold_date = null;
    }
  }
  else
  {
    $ncbh_asking_price = null;
    $ncbh_sold_price = null;
    $ncbh_sold_date = null;
  }
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
  $total_floor_houses++;
  $houses = $houses.",{\"h\":".jsonstr($ncbh_house).",\"oa\":".jsonstrval($ncbh_outer_area).",\"ia\":".jsonstrval($ncbh_inner_area).",\"t\":".jsonstr($ncbh_type).",\"s\":".jsonstrval($ncbh_status).",\"ap\":".jsonstrval($ncbh_asking_price).",\"sp\":".jsonstrval($ncbh_sold_price).",\"sd\":".jsonstr($ncbh_sold_date)."}";
}
mysqli_free_result($result);
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

$houses = substr($houses, 1);
$floors = $floors.",{\"f\":".jsonstrval($current_floor).",\"t\":".jsonstrval($total_floor_houses).",\"hs\":[".$houses."]}";
$floors = substr($floors, 1);
$json = "{\"cr\":".jsonstr($credit).",\"t\":".jsonstrval($total_houses).",\"fs\":[".$floors."]}";

echo $json;

?>