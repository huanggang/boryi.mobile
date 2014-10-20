<?php

include_once 'util_global.php';
include_once 'util_data.php';

$openid = isset($_GET["oi"]) ? $_GET["oi"] : null;
if (is_null($openid))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$type = isset($_GET['t']) ? str2int($_GET['t']) : 0; // 1: nearby-job, 2: nearby-hire, 3: nearby-shop, 4: nearby-news
if ($type < 1 || $type > 4)
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

$json = null;

$l_latitude = null;
$l_longitude = null;

//mysqli_query($con, "LOCK TABLES login_l READ, user_credits_ucr WRITE");
// check if user is online with location info
$query_1 = "SELECT l_latitude, l_longitude FROM login_l WHERE l_openid=".sqlstr($openid);
$result = mysqli_query($con, $query_1);
if ($row = mysqli_fetch_array($result))
{
  $l_latitude = $row['l_latitude'];
  $l_longitude = $row['l_longitude'];
  mysqli_free_result($result);
}
if (is_null($l_latitude) || is_null($l_longitude) || ($l_latitude == 0 && $l_longitude == 0))
{
  $json = "{\"result\":0,\"error\":".$errors["login location missed"]."}";
}

$now = new DateTime();
if (is_null($json))
{
  // check user credits
  $query_2 = "SELECT ucr_credit, ucr_job_start, ucr_job_count, ucr_hire_start, ucr_hire_count, ucr_shop_start, ucr_shop_count, ucr_news_start, ucr_news_count FROM user_credits_ucr WHERE ucr_openid=".sqlstr($openid);
  $result = mysqli_query($con, $query_2);
  if ($row = mysqli_fetch_array($result))
  {
    $ucr_credit = $row['ucr_credit'];
    $ucr_job_start = $row['ucr_job_start'];
    $ucr_job_count = $row['ucr_job_count'];
    $ucr_hire_start = $row['ucr_hire_start'];
    $ucr_hire_count = $row['ucr_hire_count'];
    $ucr_shop_start = $row['ucr_shop_start'];
    $ucr_shop_count = $row['ucr_shop_count'];
    $ucr_news_start = $row['ucr_news_start'];
    $ucr_news_count = $row['ucr_news_count'];
    mysqli_free_result($result);
    if ($ucr_credit < 0)
    {
      $json = "{\"result\":0,\"error\":".$errors["cannot post due to low credits"].",\"credit\":".strval($ucr_credit)."}";
    }
    else
    {
      $ucr_start = null;
      $ucr_count = 5;
      $credit_1 = 50;
      $credit_2 = 150;
      $credit_3 = 400;
      $count_1 = 2;
      $count_2 = 5;
      switch($type)
      {
        case 1:
          $ucr_start = $ucr_job_start;
          $ucr_count = $ucr_job_count;
          break;
        case 2:
          $ucr_start = $ucr_hire_start;
          $ucr_count = $ucr_hire_count;
          break;
        case 3:
          $ucr_start = $ucr_shop_start;
          $ucr_count = $ucr_shop_count;
          break;
        case 4:
          $ucr_start = $ucr_news_start;
          $ucr_count = $ucr_news_count;
          break;
      }
      if (!is_null($ucr_start) && is_same_month(new DateTime($ucr_start), $now))
      {
        if (($ucr_credit >= $credit_3) // no limit
          || ($ucr_credit >= $credit_2 && $ucr_count < $count_2) // max 5
          || ($ucr_credit >= $credit_1 && $ucr_count < $count_1)) // max 2
        {
          $json = "{\"result\":1,\"credit\":".strval($ucr_credit)."}";
        }
        else
        {
          $json = "{\"result\":0,\"error\":".$errors["cannot post due to over limits"].",\"credit\":".strval($ucr_credit)."}";
        }
      }
      else
      {
        $json = "{\"result\":1,\"credit\":".strval($ucr_credit)."}";
      }
    }
  }
  if (is_null($json))
  {
    $json = "{\"result\":0}";
  }
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;

?>