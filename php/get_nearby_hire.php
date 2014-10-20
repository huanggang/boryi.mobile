<?php

include_once 'util_global.php';
include_once 'util_data.php';

$id = isset($_POST["i"]) ? str2int($_POST["i"]) : 0;
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

//mysqli_query($con, "LOCK TABLES nearby_hire_info_nh WRITE");
$query_1 = "SELECT nh_end, nh_content, nh_wx, nh_qq, nh_phone, nh_email, nh_address, nh_views FROM nearby_hire_info_nh WHERE nh_id=".sqlstrval($id);
$result = mysqli_query($con, $query_1);
if ($row = mysqli_fetch_array($result))
{
  $nh_end = $row['nh_end'];
  $nh_content = $row['nh_content'];
  $nh_wx = $row['nh_wx'];
  $nh_qq = $row['nh_qq'];
  $nh_phone = $row['nh_phone'];
  $nh_email = $row['nh_email'];
  $nh_address = $row['nh_address'];
  $nh_views = $row['nh_views'];
  mysqli_free_result($result);

  $json = "{\"e\":".jsonstr($nh_end).",\"c\":".jsonstr($nh_content).",\"wx\":".jsonstr($nh_wx).",\"qq\":".jsonstr($nh_qq).",\"ph\":".jsonstr($nh_phone).",\"em\":".jsonstr($nh_email).",\"ad\":".jsonstr($nh_address).",\"vw\":".jsonstrval($nh_views)."}";

  $nh_views++;
  $query_2 = "UPDATE nearby_hire_info_nh SET nh_views=".sqlstrval($nh_views)." WHERE nh_id=".sqlstrval($id);
  mysqli_query($con, $query_2);
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;

?>