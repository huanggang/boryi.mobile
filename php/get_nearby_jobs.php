<?php

include_once 'util_global.php';
include_once 'util_data.php';

$openid = $_POST["oi"];
if (is_null($openid))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$ids = isset($_POST["s"]) ? $_POST["s"] : null;

$con=mysqli_connect($db_host, $db_user, $db_pwd, $db_name);
// Check connection
if (mysqli_connect_errno())
{
  echo "{\"result\":0,\"error\":".$errors["db connection failure"]."}";
  exit;
}
mysqli_set_charset($con, "UTF8");

$total = 0;
$jobs = "";
$json = null;

$l_latitude = null;
$l_longitude = null;

//mysqli_query($con, "LOCK TABLES login_l READ, nearby_jobs_nj READ, nearby_job_info_nj READ");
// check if user is online with location info
$query_1 = "SELECT l_latitude, l_longitude FROM login_l WHERE l_openid=".sqlstr($openid);
$result = mysqli_query($con, $query_1);
if ($row = mysqli_fetch_array($result))
{
  $l_latitude = $row['l_latitude'];
  $l_longitude = $row['l_longitude'];
  mysqli_free_result($result);
}
if (is_null($l_latitude) || is_null($l_longitude))
{
  $json = "{\"result\":0,\"error\":".$errors["login location missed"]."}";
}

if (is_null($json))
{
  $nj_ids = array();
  if (is_null($ids)) // first page query
  {
    $total = 0;
    $distance = $distance_min;
    while ($total < $per_page && $distance <= $distance_max)
    {
      $number = $distance > $distance_min ? $per_page : null;
      $query_1 = get_geo_distance_query('nearby_jobs_nj', 'nj_id,nj_lat,nj_lng', 'nj_lat', 'nj_lng', $l_latitude, $l_longitude, $distance, $number);
    
      $total = 0;
      $nj_ids = array();
      $result = mysqli_query($con, $query_1);
      while ($row = mysqli_fetch_array($result))
      {
        $nj_id = $row['nj_id'];
        $nj_lat = $row['nj_lat'];
        $nj_lng = $row['nj_lng'];
        $nj_dist = $row['distance'];

        $id = array(intval($nj_id), floatval($nj_lat), floatval($nj_lng), floatval($nj_dist));
        $nj_ids[$total] = $id;

        $total++;
      }
      mysqli_free_result($result);

      if ($distance > $distance_min && $total > $per_page)
      {
        $total = $per_page;
      }
      $distance += $distance_step;
    }
  }
  else // $ids is not null
  {
    $nj_ids_ = explode(",", $ids);
    $length = sizeof($nj_ids_);
    if ($length > $per_page)
    {
      $length = $per_page;
    }
    for($i = 0; $i < $length; $i++)
    {
      $nj_ids[$i] = array(intval($nj_ids_[$i]), null, null, null);
    }
  }

  $length = sizeof($nj_ids);
  if ($length > $per_page)
  {
    $length = $per_page;
  }
  for ($i = 0; $i < $length; $i++) // get job-detail information
  {
    $query_2 = "SELECT nj_start, nj_title, nj_type, nj_sex, nj_age_l, nj_age_h, nj_height_l, nj_height_h, nj_edu, nj_exp, nj_salary_l, nj_salary_h, nj_company FROM nearby_job_info_nj WHERE nj_id=".sqlstrval($nj_ids[$i][0]);
    $result = mysqli_query($con, $query_2);
    if ($row = mysqli_fetch_array($result))
    {
      $nj_start = $row['nj_start'];
      $nj_title = $row['nj_title'];
      $nj_type = $row['nj_type'];
      $nj_sex = $row['nj_sex'];
      $nj_age_l = $row['nj_age_l'];
      $nj_age_h = $row['nj_age_h'];
      $nj_height_l = $row['nj_height_l'];
      $nj_height_h = $row['nj_height_h'];
      $nj_edu = $row['nj_edu'];
      $nj_exp = $row['nj_exp'];
      $nj_salary_l = $row['nj_salary_l'];
      $nj_salary_h = $row['nj_salary_h'];
      $nj_company = $row['nj_company'];
      mysqli_free_result($result);

      $jobs = $jobs.",{\"i\":".jsonstrval($nj_ids[$i][0]).",\"lat\":".jsonstrval($nj_ids[$i][1]).",\"lng\":".jsonstrval($nj_ids[$i][2]).",\"d\":".jsonstrval($nj_ids[$i][3]).",\"s\":".jsonstr($nj_start).",\"t\":".jsonstr($nj_title).",\"ty\":".jsonstr($nj_type).",\"sx\":".jsonstrval($nj_sex).",\"al\":".jsonstrval($nj_age_l).",\"ah\":".jsonstrval($nj_age_h).",\"hl\":".jsonstrval($nj_height_l).",\"hh\":".jsonstrval($nj_height_h).",\"edu\":".jsonstrval($nj_edu).",\"exp\":".jsonstrval($nj_exp).",\"sl\":".jsonstrval($nj_salary_l).",\"sh\":".jsonstrval($nj_salary_h).",\"c\":".jsonstr($nj_company)."}";
    }
  }

  for ($i = $length; $i < sizeof($nj_ids); $i++)
  {
    $jobs = $jobs.",{\"i\":".jsonstrval($nj_ids[$i][0]).",\"lat\":".jsonstrval($nj_ids[$i][1]).",\"lng\":".jsonstrval($nj_ids[$i][2]).",\"d\":".jsonstrval($nj_ids[$i][3])."}";
  }
  $jobs = substr($jobs, 1);

  $json = "{\"lat\":".jsonstrval($l_latitude).",\"lng\":".jsonstrval($l_longitude).",\"t\":".$total.",\"j\":[".$jobs."]}";
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;

?>