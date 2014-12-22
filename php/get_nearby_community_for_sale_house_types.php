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

$types="";
$total_houses = 0;
//mysqli_query($con, "LOCK TABLES nearby_community_building_houses_ncbh READ");
$query_1 = "SELECT ncbh_type, COUNT(ncbh_id) AS total FROM nearby_community_building_houses_ncbh WHERE ncbh_nc_id=".sqlstrval($id)." AND ncbh_status=0 GROUP BY ncbh_type";
$result = mysqli_query($con, $query_1);
while ($row = mysqli_fetch_array($result))
{
  $ncbh_type = $row['ncbh_type'];
  $total = $row['total'];

  $total_houses += $total;

  $types = $types.",{\"ty\":".jsonstr($ncbh_type).",\"t\":".jsonstrval($total)."}";
}
mysqli_free_result($result);
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

$types = substr($types, 1);
$json = "{\"t\":".jsonstrval($total_houses).",\"ts\":[".$types."]}";

echo $json;

?>