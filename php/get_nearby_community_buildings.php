<?php

include_once 'util_global.php';
include_once 'util_data.php';

$id = isset($_POST["c"]) ? str2int($_POST["c"]) : 0;
if ($id < 1)
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

$buildings="";
//mysqli_query($con, "LOCK TABLES nearby_community_buildings_ncb READ");
$query_1 = "SELECT ncb_id, ncb_name, ncb_pre_sale_date, ncb_sale_permit_id, ncb_property_id, ncb_land_id, ncb_land_plan_id, ncb_construction_id, ncb_construction_plan_id FROM nearby_community_buildings_ncb WHERE ncb_nc_id=".sqlstrval($id);
$result = mysqli_query($con, $query_1);
while ($row = mysqli_fetch_array($result))
{
  $ncb_id = $row['ncb_id'];
  $ncb_name = $row['ncb_name'];
  $ncb_pre_sale_date = $row['ncb_pre_sale_date'];
  $ncb_sale_permit_id = $row['ncb_sale_permit_id'];
  $ncb_property_id = $row['ncb_property_id'];
  $ncb_land_id = $row['ncb_land_id'];
  $ncb_land_plan_id = $row['ncb_land_plan_id'];
  $ncb_construction_id = $row['ncb_construction_id'];
  $ncb_construction_plan_id = $row['ncb_construction_plan_id'];

  $buildings = $buildings.",{\"i\":".jsonstrval($ncb_id).",\"n\":".jsonstr($ncb_name).",\"d\":".jsonstr($ncb_pre_sale_date).",\"sp\":".jsonstr($ncb_sale_permit_id).",\"p\":".jsonstr($ncb_property_id).",\"l\":".jsonstr($ncb_land_id).",\"lp\":".jsonstr($ncb_land_plan_id).",\"c\":".jsonstr($ncb_construction_id).",\"cp\":".jsonstr($ncb_construction_plan_id)."}";
}
mysqli_free_result($result);
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

$buildings = substr($buildings, 1);
$json = "{\"bs\":[".$buildings."]}";

echo $json;

?>