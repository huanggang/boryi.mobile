<?php

include_once 'util_global.php';
include_once 'util_data.php';
include_once 'ac/AhoCorasickMatch.php';

$openid = $_POST["oi"];
if (is_null($openid))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$end = str2datetime($_POST['e']);
$end = new DateTime($end->format('Y-m-d'));
if (is_null($end))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
else if (!is_valid_end($end))
{
  echo "{\"result\":0,\"error\":".$errors["invalid end date"]."}";
  exit;
}
$titles = $_POST['t'];
$titles = verify_string_length($titles, 2, 64);
if (is_null($titles))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
else
{
  $res = ac_match($titles);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
}
$location = $_POST['l'];
$location = verify_string_length($location, 2, 256);
if (is_null($location))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
else
{
  $res = ac_match($location);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
}
$content = $_POST['c'];
$content = verify_string_length($content, 4, 512);
if (is_null($content))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
else
{
  $res = ac_match($content);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
}
$duration = str2int($_POST['dur']);
if ($duration <= 0 || $duration > 1000)
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$contact = $_POST['cnt'];
$contact = verify_string_length($contact, 2, 32);
if (is_null($contact))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
else
{
  $res = ac_match($contact);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
}
$phone = isset($_POST['phn']) ? $_POST['phn'] : null;
$phone = verify_string_length($phone, 7, 64);
$phone = format_phones($phone);
$email = isset($_POST['eml']) ? $_POST['eml'] : null;
$email = verify_string_length($email, 7, 64);
$email = format_emails($email);
$address = isset($_POST['add']) ? $_POST['add'] : null;
$address = verify_string_length($address, 4, 256);
if (is_null($phone) && is_null($email) && is_null($address))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
else if (!is_null($address))
{
  $res = ac_match($address);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
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

//mysqli_query($con, "LOCK TABLES login_l READ, user_credits_ucr WRITE, nearby_hire_info_nh WRITE, nearby_hires_nh WRITE");
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

$now = new DateTime();
if (is_null($json))
{
  // check user credits
  $query_2 = "SELECT ucr_credit, ucr_hire_start, ucr_hire_count FROM user_credits_ucr WHERE ucr_openid=".sqlstr($openid);
  $result = mysqli_query($con, $query_2);
  if ($row = mysqli_fetch_array($result))
  {
    $ucr_credit = $row['ucr_credit'];
    $ucr_hire_start = $row['ucr_hire_start'];
    $ucr_hire_count = $row['ucr_hire_count'];
    mysqli_free_result($result);
    if ($ucr_credit < 0)
    {
      $json = "{\"result\":0,\"error\":".$errors["cannot post due to low credits"]."}";
    }
    else
    {
      if (!is_null($ucr_hire_start) && is_same_month(new DateTime($ucr_hire_start), $now))
      {
        if (($ucr_credit >= 400) // no limit
          || ($ucr_credit >= 150 && $ucr_hire_count < 5) // max 5
          || ($ucr_credit >= 50 && $ucr_hire_count < 2)) // max 2
        {
          $ucr_hire_count++;
          $query_3 = "UPDATE user_credits_ucr SET ucr_hire_count=".sqlstrval($ucr_hire_count)." WHERE ucr_openid=".sqlstr($openid);
          mysqli_query($con, $query_3);
        }
        else
        {
          $json = "{\"result\":0,\"error\":".$errors["cannot post due to over limits"]."}";
        }
      }
      else
      {
        $query_3 = "UPDATE user_credits_ucr SET ucr_hire_start=".sqlstr($now->format('Y-m-d')).", ucr_hire_count=1 WHERE ucr_openid=".sqlstr($openid);
        mysqli_query($con, $query_3);
      }

      if (is_null($json))
      {
        $id = 0;

        $query_4 = "INSERT INTO nearby_hire_info_nh (nh_openid,nh_start,nh_end,nh_titles,nh_location,nh_content,nh_duration,nh_contact,nh_phone,nh_email,nh_address) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
        $query_5 = "SELECT last_insert_id() AS id";
        $query_6 = "INSERT INTO nearby_hires_nh (nh_id,nh_lat,nh_lng) VALUES (?,?,?)";

        $stmt_4 = mysqli_prepare($con, $query_4);
        mysqli_stmt_bind_param($stmt_4, "ssssssissss", $openid,$now->format("Y-m-d H:i:s"),$end->format("Y-m-d"),$titles,$location,$content,$duration,$contact,$phone,$email,$address);
        mysqli_stmt_execute($stmt_4);
        mysqli_stmt_close($stmt_4);

        $result = mysqli_query($con, $query_5);
        if ($row = mysqli_fetch_array($result))
        {
          $id = $row['id'];
          mysqli_free_result($result);
        }

        if ($id > 0)
        {
          $stmt_6 = mysqli_prepare($con, $query_6);
          mysqli_stmt_bind_param($stmt_6, "idd", $id,$l_latitude,$l_longitude);
          mysqli_stmt_execute($stmt_6);
          mysqli_stmt_close($stmt_6);
          $json = "{\"result\":1}";
        }
        else
        {
          $json = "{\"result\":0,\"error\":".$errors["db write failure"]."}";
        }
      }
    }
  }
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;

function is_valid_end($end)
{
  $now = new DateTime;
  $today = $now->format('Y-m-d');
  $today = new DateTime($today);
  $days = $today->diff($end)->days;
  return (($end > $today) && ($days <= 15) && ($days >= 5));
}

?>