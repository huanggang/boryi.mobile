<?php

include_once 'util_global.php';
include_once 'util_data.php';
include_once 'ac/AhoCorasickMatch.php';

$openid = isset($_POST["oi"]) ? $_POST["oi"] : null;
if (is_null($openid))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$start = isset($_POST['s']) ? str2datetime($_POST['s']) : null;
if (is_null($start))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$start = new DateTime($start->format('Y-m-d'));
$end = isset($_POST['e']) ? str2datetime($_POST['e']) : null;
if (is_null($end))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$end = new DateTime($end->format('Y-m-d'));
if (!is_valid_start_end($start, $end))
{
  echo "{\"result\":0,\"error\":".$errors["invalid end date"]."}";
  exit;
}
$title = isset($_POST['t']) ? $_POST['t'] : null;
if (is_null($title))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$title = verify_string_length($title, 2, 128);
$res = ac_match($title);
if (!is_null($res) && sizeof($res) > 0)
{
  echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
  exit;
}
$cat_id = isset($_POST['cid']) ? str2int($_POST['cid']) : 0;
if ($cat_id <= 0)
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$content = isset($_POST['ct']) ? $_POST['ct'] : null;
if (!is_null($content))
{
  $content = verify_string_length($content, 1, 512);
  $res = ac_match($content);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
}
$photo = null;
$photo_tmp = null;
if (isset($_FILES["file"]))
{
  $file_name = $_FILES["file"]["name"];
  $file_tmp_name = $_FILES["file"]["tmp_name"];
  $file_type = $_FILES["file"]["type"];
  $file_size = $_FILES["file"]["size"];
  $file_error = $_FILES["file"]["error"];
  if ((($file_type == 'image/gif') || ($file_type == 'image/jpeg') || ($file_type == 'image/pjpeg') || ($file_type == 'image/png') || ($file_type == 'image/x-png') || ($file_type == 'image/bmp')) && $file_size < $max_photo_size)
  {
    if ($file_error > 0)
    {
      echo "{\"result\":0,\"error\":".$errors["upload file failed"]."}";
      exit;
    }
    else
    {
      $photo = $file_name;
      $photo_tmp = $file_tmp_name;
      if (strlen($photo) > 128)
      {
        $photo = null;
      }
    }
  }
  else
  {
    echo "{\"result\":0,\"error\":".$errors["upload illegal file"]."}";
    exit;
  }
}
$wx = isset($_POST['wx']) ? $_POST['wx'] : null;
if (!is_null($wx))
{
  $wx = verify_string_length($wx, 6, 64);
  $wx = format_wxs($wx);
}
$qq = isset($_POST['qq']) ? $_POST['qq'] : null;
if (!is_null($qq))
{
  $qq = verify_string_length($qq, 4, 64);
  $qq = format_qqs($qq);
}
$phone = isset($_POST['phn']) ? $_POST['phn'] : null;
if (!is_null($phone))
{
  $phone = verify_string_length($phone, 7, 64);
  $phone = format_phones($phone);
}
$address = isset($_POST['add']) ? $_POST['add'] : null;
if (is_null($wx) && is_null($qq) && is_null($phone) && is_null($address))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
else if (!is_null($address))
{
  $address = verify_string_length($address, 4, 256);
  $res = ac_match($address);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
}

//global $db_host, $db_user, $db_pwd, $db_name;
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

//mysqli_query($con, "LOCK TABLES login_l READ, user_credits_ucr WRITE, nearby_news_info_nn WRITE, nearby_news_nn WRITE");
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
  $query_2 = "SELECT ucr_credit, ucr_news_start, ucr_news_count FROM user_credits_ucr WHERE ucr_openid=".sqlstr($openid);
  $result = mysqli_query($con, $query_2);
  if ($row = mysqli_fetch_array($result))
  {
    $ucr_credit = $row['ucr_credit'];
    $ucr_news_start = $row['ucr_news_start'];
    $ucr_news_count = $row['ucr_news_count'];
    mysqli_free_result($result);
    if ($ucr_credit < 0)
    {
      $json = "{\"result\":0,\"error\":".$errors["cannot post due to low credits"]."}";
    }
    else
    {
      if (!is_null($ucr_news_start) && is_same_month(new DateTime($ucr_news_start), $now))
      {
        if (($ucr_credit >= 400) // no limit
          || ($ucr_credit >= 150 && $ucr_news_count < 5) // max 5
          || ($ucr_credit >= 50 && $ucr_news_count < 2)) // max 2
        {
          $ucr_credit++;
          $ucr_news_count++;
          $query_3 = "UPDATE user_credits_ucr SET ucr_credit=".strval($ucr_credit).", ucr_news_count=".sqlstrval($ucr_news_count)." WHERE ucr_openid=".sqlstr($openid);
          mysqli_query($con, $query_3);
        }
        else
        {
          $json = "{\"result\":0,\"error\":".$errors["cannot post due to over limits"]."}";
        }
      }
      else
      {
        $ucr_credit++;
        $query_3 = "UPDATE user_credits_ucr SET ucr_credit=".strval($ucr_credit).", ucr_news_start=".sqlstr($now->format('Y-m-d')).", ucr_news_count=1 WHERE ucr_openid=".sqlstr($openid);
        mysqli_query($con, $query_3);
      }

      if (is_null($json))
      {
        $id = 0;

        $query_4 = "INSERT INTO nearby_news_info_nn (nn_openid,nn_post,nn_start,nn_end,nn_title,nn_content,nn_wx,nn_qq,nn_phone,nn_address) VALUES (?,?,?,?,?,?,?,?,?,?)";
        $query_5 = "SELECT last_insert_id() AS id";
        $query_6 = "INSERT INTO nearby_news_nn (nn_id,nn_lat,nn_lng,nn_nws_cat_id) VALUES (?,?,?,?)";
        $query_7 = "UPDATE nearby_news_info_nn SET nn_photo=? WHERE nn_id=?";

        $stmt_4 = mysqli_prepare($con, $query_4);
        mysqli_stmt_bind_param($stmt_4, "ssssssssss", $openid,$now->format("Y-m-d H:i:s"),$start->format("Y-m-d"),$end->format("Y-m-d"),$title,$content,$wx,$qq,$phone,$address);
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
          mysqli_stmt_bind_param($stmt_6, "iddi", $id,$l_latitude,$l_longitude,$cat_id);
          mysqli_stmt_execute($stmt_6);
          mysqli_stmt_close($stmt_6);
          if (!is_null($photo))
          {
            $photo = $dir_photo . $photo;
            move_uploaded_file($photo_tmp, "../" . $photo);
            $stmt_7 = mysqli_prepare($con, $query_7);
            mysqli_stmt_bind_param($stmt_7, "si", $photo,$id);
            mysqli_stmt_execute($stmt_7);
            mysqli_stmt_close($stmt_7);
          }
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

function is_valid_start_end($start, $end)
{
  $now = new DateTime;
  $today = $now->format('Y-m-d');
  $today = new DateTime($today);
  $days1 = $today->diff($start)->days;
  $days2 = $start->diff($end)->days;
  return (($start >= $today) && ($end >= $start) && ($days1 <= 7) && ($days2 <= 31));
}

function format_boolean($value)
{
  if ($value < 0)
  {
    return null;
  }
  else if ($value > 0)
  {
    return 1;
  }
  return 0;
}

function format_shop_attribute_ids($ids)
{
  if (is_null($ids))
  {
    return null;
  }
  $ids = preg_split("/[^\d]+/", $ids);
  $pattern = "/^\d{10}$/";
  $value = "";
  for ($i = 0; $i < sizeof($ids); $i++)
  {
    if ((preg_match($pattern, $ids[$i]) == 1) && strlen($value) < 100)
    {
      $value = $value.",".$ids[$i];
    }
  }
  if (strlen($value) == 0)
  {
    return null;
  }
  return substr($value, 1);
}

?>