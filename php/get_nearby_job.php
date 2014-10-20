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

//mysqli_query($con, "LOCK TABLES nearby_job_info_nj WRITE");
$query_1 = "SELECT nj_end, nj_social_security, nj_housing_fund, nj_annual_vacations, nj_housing, nj_meals, nj_travel, nj_overtime, nj_nightshift, nj_requirement, nj_description, nj_benefit, nj_wx, nj_qq, nj_phone, nj_email, nj_address, nj_views FROM nearby_job_info_nj WHERE nj_id=".sqlstrval($id);
$result = mysqli_query($con, $query_1);
if ($row = mysqli_fetch_array($result))
{
  $nj_end = $row['nj_end'];
  $nj_social_security = $row['nj_social_security'];
  $nj_housing_fund = $row['nj_housing_fund'];
  $nj_annual_vacations = $row['nj_annual_vacations'];
  $nj_housing = $row['nj_housing'];
  $nj_meals = $row['nj_meals'];
  $nj_travel = $row['nj_travel'];
  $nj_overtime = $row['nj_overtime'];
  $nj_nightshift = $row['nj_nightshift'];
  $nj_requirement = $row['nj_requirement'];
  $nj_description = $row['nj_description'];
  $nj_benefit = $row['nj_benefit'];
  $nj_wx = $row['nj_wx'];
  $nj_qq = $row['nj_qq'];
  $nj_phone = $row['nj_phone'];
  $nj_email = $row['nj_email'];
  $nj_address = $row['nj_address'];
  $nj_views = $row['nj_views'];
  mysqli_free_result($result);

  $json = "{\"e\":".jsonstr($nj_end).",\"ss\":".jsonstrval($nj_social_security).",\"hf\":".jsonstrval($nj_housing_fund).",\"av\":".jsonstrval($nj_annual_vacations).",\"hs\":".jsonstrval($nj_housing).",\"ml\":".jsonstrval($nj_meals).",\"tr\":".jsonstrval($nj_travel).",\"ot\":".jsonstrval($nj_overtime).",\"ns\":".jsonstrval($nj_nightshift).",\"rqr\":".jsonstr($nj_requirement).",\"dsc\":".jsonstr($nj_description).",\"bnf\":".jsonstr($nj_benefit).",\"wx\":".jsonstr($nj_wx).",\"qq\":".jsonstr($nj_qq).",\"phn\":".jsonstr($nj_phone).",\"eml\":".jsonstr($nj_email).",\"add\":".jsonstr($nj_address).",\"vws\":".jsonstrval($nj_views)."}";

  $nj_views++;
  $query_2 = "UPDATE nearby_job_info_nj SET nj_views=".sqlstrval($nj_views)." WHERE nj_id=".sqlstrval($id);
  mysqli_query($con, $query_2);
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;

?>