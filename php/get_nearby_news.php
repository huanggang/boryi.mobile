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

//mysqli_query($con, "LOCK TABLES nearby_news_info_nn WRITE");
$query_1 = "SELECT nn_post, nn_content, nn_photo, nn_wx, nn_qq, nn_phone, nn_address, nn_views FROM nearby_news_info_nn WHERE nn_id=".sqlstrval($id);
$result = mysqli_query($con, $query_1);
if ($row = mysqli_fetch_array($result))
{
  $nn_post = $row['nn_post'];
  $nn_content = $row['nn_content'];
  $nn_photo = $row['nn_photo'];
  $nn_wx = $row['nn_wx'];
  $nn_qq = $row['nn_qq'];
  $nn_phone = $row['nn_phone'];
  $nn_address = $row['nn_address'];
  $nn_views = $row['nn_views'];
  mysqli_free_result($result);

  $json = "{\"p\":".jsonstr($nn_post).",\"ct\":".jsonstr($nn_content).",\"pt\":".jsonstr($nn_photo).",\"wx\":".jsonstr($nn_wx).",\"qq\":".jsonstr($nn_qq).",\"phn\":".jsonstr($nn_phone).",\"add\":".jsonstr($nn_address).",\"vws\":".jsonstrval($nn_views)."}";

  $nn_views++;
  $query_2 = "UPDATE nearby_news_info_nn SET nn_views=".sqlstrval($nn_views)." WHERE nn_id=".sqlstrval($id);
  mysqli_query($con, $query_2);
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;

?>