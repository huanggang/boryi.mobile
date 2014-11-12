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

//mysqli_query($con, "LOCK TABLES university_companies_unv_cmp READ, university_company_jobs_unv_cmp_jb READ");
$query_1 = "SELECT unv_cmp_overview, unv_cmp_benefit, unv_cmp_process, unv_cmp_phone, unv_cmp_email, unv_cmp_web, unv_cmp_address FROM university_companies_unv_cmp WHERE unv_cmp_id=".sqlstrval($id);
$result = mysqli_query($con, $query_1);
if ($row = mysqli_fetch_array($result))
{
  $unv_cmp_overview = $row['unv_cmp_overview'];
  $unv_cmp_benefit = $row['unv_cmp_benefit'];
  $unv_cmp_process = $row['unv_cmp_process'];
  $unv_cmp_phone = $row['unv_cmp_phone'];
  $unv_cmp_email = $row['unv_cmp_email'];
  $unv_cmp_web = $row['unv_cmp_web'];
  $unv_cmp_address = $row['unv_cmp_address'];
  mysqli_free_result($result);

  $jobs = "";
  $query_1 = "SELECT unv_cmp_jb_id, unv_cmp_jb_title, unv_cmp_jb_major, unv_cmp_jb_edu, unv_cmp_jb_place, unv_cmp_jb_salary, unv_cmp_jb_total, unv_cmp_jb_content FROM university_company_jobs_unv_cmp_jb WHERE unv_cmp_jb_unv_cmp_id=".sqlstrval($id);
  $result = mysqli_query($con, $query_1);
  while ($row = mysqli_fetch_array($result))
  {
    $unv_cmp_jb_id = $row['unv_cmp_jb_id'];
    $unv_cmp_jb_title = $row['unv_cmp_jb_title'];
    $unv_cmp_jb_major = $row['unv_cmp_jb_major'];
    $unv_cmp_jb_edu = $row['unv_cmp_jb_edu'];
    $unv_cmp_jb_place = $row['unv_cmp_jb_place'];
    $unv_cmp_jb_salary = $row['unv_cmp_jb_salary'];
    $unv_cmp_jb_total = $row['unv_cmp_jb_total'];
    $unv_cmp_jb_content = $row['unv_cmp_jb_content'];

    $jobs = $jobs.",{\"i\":".jsonstrval($unv_cmp_jb_id).",\"t\":".jsonstr($unv_cmp_jb_title).",\"m\":".jsonstr($unv_cmp_jb_major).",\"e\":".jsonstr($unv_cmp_jb_edu).",\"p\":".jsonstr($unv_cmp_jb_place).",\"s\":".jsonstr($unv_cmp_jb_salary).",\"tt\":".jsonstrval($unv_cmp_jb_total).",\"c\":".jsonstr($unv_cmp_jb_content)."}";
  }
  mysqli_free_result($result);
  if (strlen($jobs) > 0)
  {
    $jobs = substr($jobs, 1);
  }

  $json = "{\"o\":".jsonstr($unv_cmp_overview).",\"b\":".jsonstr($unv_cmp_benefit).",\"p\":".jsonstr($unv_cmp_process).",\"phn\":".jsonstr($unv_cmp_phone).",\"eml\":".jsonstr($unv_cmp_email).",\"web\":".jsonstr($unv_cmp_web).",\"add\":".jsonstr($unv_cmp_address).",\"j\":[".$jobs."]}";
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;

?>