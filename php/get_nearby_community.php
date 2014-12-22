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

$json = "{\"result\":0,\"error\":".$errors["not found"]."}";

//mysqli_query($con, "LOCK TABLES nearby_community_info_nc READ");
$query_1 = "SELECT nc_developer, nc_operation, nc_designer, nc_construction, nc_overview, nc_sale_phone, nc_address FROM nearby_community_info_nc WHERE nc_id=".sqlstrval($id);
$result = mysqli_query($con, $query_1);
if ($row = mysqli_fetch_array($result))
{
  $nc_developer = $row['nc_developer'];
  $nc_operation = $row['nc_operation'];
  $nc_designer = $row['nc_designer'];
  $nc_construction = $row['nc_construction'];
  $nc_overview = $row['nc_overview'];
  $nc_sale_phone = $row['nc_sale_phone'];
  $nc_address = $row['nc_address'];
  mysqli_free_result($result);

  $json = "{\"dev\":".jsonstr($nc_developer).",\"des\":".jsonstr($nc_designer).",\"ope\":".jsonstr($nc_operation).",\"con\":".jsonstr($nc_construction).",\"o\":".jsonstr($nc_overview).",\"phn\":".jsonstr($nc_sale_phone).",\"add\":".jsonstr($nc_address)."}";
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;

?>