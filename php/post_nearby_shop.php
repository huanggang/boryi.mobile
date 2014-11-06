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
$end = isset($_POST['e']) ? str2datetime($_POST['e']) : null;
if (is_null($end))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$end = new DateTime($end->format('Y-m-d'));
if (!is_valid_end($end))
{
  echo "{\"result\":0,\"error\":".$errors["invalid end date"]."}";
  exit;
}
$name = isset($_POST['n']) ? $_POST['n'] : null;
if (is_null($name))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$name = verify_string_length($name, 2, 64);
$res = ac_match($name);
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
$restroom = isset($_POST['rt']) ? format_boolean(str2int($_POST['rt'])) : false;
$att_ids = isset($_POST['aid']) ? $_POST['aid'] : null;
if (!is_null($att_ids))
{
  $att_ids = format_shop_attribute_ids($att_ids);
}
$business_hours = isset($_POST['bh']) ? $_POST['bh'] : null;
if (!is_null($business_hours))
{
  $business_hours = verify_string_length($business_hours, 1, 128);
  $res = ac_match($business_hours);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
}
$services = isset($_POST['sv']) ? $_POST['sv'] : null;
if (!is_null($services))
{
  $services = verify_string_length($services, 1, 512);
  $res = ac_match($services);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
}
$products = isset($_POST['pd']) ? $_POST['pd'] : null;
if (!is_null($products))
{
  $products = verify_string_length($products, 1, 512);
  $res = ac_match($products);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
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
$free_parking = isset($_POST['fp']) ? format_boolean(str2int($_POST['fp'])) : false;
$free_wifi = isset($_POST['fw']) ? format_boolean(str2int($_POST['fw'])) : false;
$cards = isset($_POST['cd']) ? format_boolean(str2int($_POST['cd'])) : false;
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

//mysqli_query($con, "LOCK TABLES login_l READ, user_credits_ucr WRITE, nearby_shop_info_ns WRITE, nearby_shops_ns WRITE");
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
  $query_2 = "SELECT ucr_credit, ucr_shop_start, ucr_shop_count FROM user_credits_ucr WHERE ucr_openid=".sqlstr($openid);
  $result = mysqli_query($con, $query_2);
  if ($row = mysqli_fetch_array($result))
  {
    $ucr_credit = $row['ucr_credit'];
    $ucr_shop_start = $row['ucr_shop_start'];
    $ucr_shop_count = $row['ucr_shop_count'];
    mysqli_free_result($result);
    if ($ucr_credit < 0)
    {
      $json = "{\"result\":0,\"error\":".$errors["cannot post due to low credits"]."}";
    }
    else
    {
      if (!is_null($ucr_shop_start) && is_same_month(new DateTime($ucr_shop_start), $now))
      {
        if (($ucr_credit >= 400) // no limit
          || ($ucr_credit >= 150 && $ucr_shop_count < 5) // max 5
          || ($ucr_credit >= 50 && $ucr_shop_count < 2)) // max 2
        {
          $ucr_credit++;
          $ucr_shop_count++;
          $query_3 = "UPDATE user_credits_ucr SET ucr_credit=".strval($ucr_credit).", ucr_shop_count=".sqlstrval($ucr_shop_count)." WHERE ucr_openid=".sqlstr($openid);
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
        $query_3 = "UPDATE user_credits_ucr SET ucr_credit=".strval($ucr_credit).", ucr_shop_start=".sqlstr($now->format('Y-m-d')).", ucr_shop_count=1 WHERE ucr_openid=".sqlstr($openid);
        mysqli_query($con, $query_3);
      }

      if (is_null($json))
      {
        $id = 0;

        $query_4 = "INSERT INTO nearby_shop_info_ns (ns_openid,ns_owner_openid,ns_start,ns_end,ns_shp_att_ids,ns_business_hours,ns_services,ns_products,ns_content,ns_free_parking,ns_free_wifi,ns_cards,ns_wx,ns_qq,ns_phone,ns_address) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        $query_5 = "SELECT last_insert_id() AS id";
        $query_6 = "INSERT INTO nearby_shops_ns (ns_id,ns_lat,ns_lng,ns_shp_cat_id,ns_name,ns_restroom) VALUES (?,?,?,?,?,?)";

        $stmt_4 = mysqli_prepare($con, $query_4);
        mysqli_stmt_bind_param($stmt_4, "sssssssssiiissss", $openid,$openid,$now->format("Y-m-d H:i:s"),$end->format("Y-m-d"),$att_ids,$business_hours,$services,$products,$content,$free_parking,$free_wifi,$cards,$wx,$qq,$phone,$address);
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
          mysqli_stmt_bind_param($stmt_6, "iddisi", $id,$l_latitude,$l_longitude,$cat_id,$name,$restroom);
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
  return (($end > $today) && ($days <= 31) && ($days >= 15));
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