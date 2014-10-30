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

//mysqli_query($con, "LOCK TABLES nearby_shop_info_ns WRITE");
$query_1 = "SELECT ns_openid, ns_owner_openid, ns_end, ns_business_hours, ns_services, ns_products, ns_content, ns_free_parking, ns_free_wifi, ns_cards, ns_wx, ns_qq, ns_phone, ns_address, ns_views FROM nearby_shop_info_ns WHERE ns_id=".sqlstrval($id);
$result = mysqli_query($con, $query_1);
if ($row = mysqli_fetch_array($result))
{
  $ns_openid = $row['ns_openid'];
  $ns_owner_openid = $row['ns_owner_openid'];
  $ns_end = $row['ns_end'];
  $ns_business_hours = $row['ns_business_hours'];
  $ns_services = $row['ns_services'];
  $ns_products = $row['ns_products'];
  $ns_content = $row['ns_content'];
  $ns_free_parking = $row['ns_free_parking'];
  $ns_free_wifi = $row['ns_free_wifi'];
  $ns_cards = $row['ns_cards'];
  $ns_wx = $row['ns_wx'];
  $ns_qq = $row['ns_qq'];
  $ns_phone = $row['ns_phone'];
  $ns_address = $row['ns_address'];
  $ns_views = $row['ns_views'];
  mysqli_free_result($result);

  $json = "{\"oi\":".jsonstr($ns_openid).",\"ooi\":".jsonstr($ns_owner_openid).",\"e\":".jsonstr($ns_end).",\"bh\":".jsonstr($ns_business_hours).",\"sv\":".jsonstr($ns_services).",\"pd\":".jsonstr($ns_products).",\"ct\":".jsonstr($ns_content).",\"fp\":".jsonstrval($ns_free_parking).",\"fw\":".jsonstrval($ns_free_wifi).",\"cd\":".jsonstrval($ns_cards).",\"wx\":".jsonstr($ns_wx).",\"qq\":".jsonstr($ns_qq).",\"phn\":".jsonstr($ns_phone).",\"add\":".jsonstr($ns_address).",\"vws\":".jsonstrval($ns_views)."}";

  $ns_views++;
  $query_2 = "UPDATE nearby_shop_info_ns SET ns_views=".sqlstrval($ns_views)." WHERE ns_id=".sqlstrval($id);
  mysqli_query($con, $query_2);
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;

?>