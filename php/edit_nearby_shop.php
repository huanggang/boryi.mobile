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
$id = isset($_POST["i"]) ? str2int($_POST["i"]) : 0;
if ($id <= 0)
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$type = isset($_POST["t"]) ? str2int($_POST["t"]) : 0;
if ($type <= 0)
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}

$cat_id = null;
$restroom = null;
$att_ids = null;
$business_hours = null;
$services = null;
$products = null;
$content = null;
$free_parking = null;
$free_wifi = null;
$cards = null;
$wx = null;
$qq = null;
$phone = null;
$address = null;
$star = null;
switch ($type)
{
  case 1: // business hours
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
    if (is_null($business_hours))
    {
      exit;
    }
    break;
  case 2: // services
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
    if (is_null($services))
    {
      exit;
    }
    break;
  case 3: // products
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
    if (is_null($products))
    {
      exit;
    }
    break;
  case 4: // content
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
    if (is_null($content))
    {
      exit;
    }
    break;
  case 5: // restroom, free parking, free wifi, cards
    $restroom = isset($_POST['rt']) ? format_boolean(str2int($_POST['rt'])) : false;
    $free_parking = isset($_POST['fp']) ? format_boolean(str2int($_POST['fp'])) : false;
    $free_wifi = isset($_POST['fw']) ? format_boolean(str2int($_POST['fw'])) : false;
    $cards = isset($_POST['cd']) ? format_boolean(str2int($_POST['cd'])) : false;
    break;
  case 6: // wx, QQ, phone, address
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
    break;
  case 7: // attribute ids
    $att_ids = isset($_POST['aid']) ? $_POST['aid'] : null;
    if (!is_null($att_ids))
    {
      $att_ids = format_shop_attribute_ids($att_ids);
    }
    break;
  case 8: // comment/star
    $star = isset($_POST["st"]) ? str2int($_POST["st"]) : 0;
    if ($star <= 0)
    {
      echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
      exit;
    }
    break;
  case 9: // GPS latitude, longitude
    break;
  case 10: // shop category id and attributes
    $cat_id = isset($_POST["ci"]) ? str2int($_POST["ci"]) : 0;
    if ($cat_id <= 0)
    {
      echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
      exit;
    }
    $att_ids = isset($_POST['aid']) ? $_POST['aid'] : null;
    if (!is_null($att_ids))
    {
      $att_ids = format_shop_attribute_ids($att_ids);
    }
    break;
  case 11: // end date - refresh
    break;
  case 12: // close / shutdown
    break;
  default: // unknown type
    echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
    exit;
    break;
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

//mysqli_query($con, "LOCK TABLES login_l READ, user_credits_ucr WRITE, nearby_shop_info_ns WRITE, nearby_shops_ns WRITE, nearby_old_shops_nos WRITE");
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
  $query_2 = "SELECT ucr_credit FROM user_credits_ucr WHERE ucr_openid=".sqlstr($openid);
  $result = mysqli_query($con, $query_2);
  if ($row = mysqli_fetch_array($result))
  {
    $ucr_credit = $row['ucr_credit'];
    mysqli_free_result($result);
    if ($ucr_credit < 0)
    {
      $json = "{\"result\":0,\"error\":".$errors["cannot post due to low credits"]."}";
    }
    else
    {
      $json = "{\"result\":1}";
      switch ($type)
      {
        case 1: // business housrs
          $query_3 = "UPDATE nearby_shop_info_ns SET ns_openid=?,ns_business_hours=? WHERE ns_id=? AND (ns_certified_openid IS NULL OR ns_certified_openid=?)";
          $stmt_3 = mysqli_prepare($con, $query_3);
          mysqli_stmt_bind_param($stmt_3, "ssis", $openid,$business_hours,$id,$openid);
          mysqli_stmt_execute($stmt_3);
          mysqli_stmt_close($stmt_3);
          break;
        case 2: // services
          $query_3 = "UPDATE nearby_shop_info_ns SET ns_openid=?,ns_services=? WHERE ns_id=? AND (ns_certified_openid IS NULL OR ns_certified_openid=?)";
          $stmt_3 = mysqli_prepare($con, $query_3);
          mysqli_stmt_bind_param($stmt_3, "ssis", $openid,$services,$id,$openid);
          mysqli_stmt_execute($stmt_3);
          mysqli_stmt_close($stmt_3);
          break;
        case 3: // products
          $query_3 = "UPDATE nearby_shop_info_ns SET ns_openid=?,ns_products=? WHERE ns_id=? AND (ns_certified_openid IS NULL OR ns_certified_openid=?)";
          $stmt_3 = mysqli_prepare($con, $query_3);
          mysqli_stmt_bind_param($stmt_3, "ssis", $openid,$products,$id,$openid);
          mysqli_stmt_execute($stmt_3);
          mysqli_stmt_close($stmt_3);
          break;
        case 4: // content
          $query_3 = "UPDATE nearby_shop_info_ns SET ns_openid=?,ns_content=? WHERE ns_id=? AND (ns_certified_openid IS NULL OR ns_certified_openid=?)";
          $stmt_3 = mysqli_prepare($con, $query_3);
          mysqli_stmt_bind_param($stmt_3, "ssis", $openid,$content,$id,$openid);
          mysqli_stmt_execute($stmt_3);
          mysqli_stmt_close($stmt_3);
          break;
        case 5: // restroom, free parking, free wifi, cards
          $query_3 = "UPDATE nearby_shop_info_ns SET ns_openid=?,ns_free_parking=?,ns_free_wifi=?,ns_cards=? WHERE ns_id=? AND (ns_certified_openid IS NULL OR ns_certified_openid=?)";
          $stmt_3 = mysqli_prepare($con, $query_3);
          mysqli_stmt_bind_param($stmt_3, "siiiis", $openid,$free_parking,$free_wifi,$cards,$id,$openid);
          $flag = mysqli_stmt_execute($stmt_3);
          mysqli_stmt_close($stmt_3);
          if ($flag)
          {
            $query_3 = "UPDATE nearby_shops_ns SET ns_restroom=? WHERE ns_id=?";
            $stmt_3 = mysqli_prepare($con, $query_3);
            mysqli_stmt_bind_param($stmt_3, "ii", $restroom,$id);
            mysqli_stmt_execute($stmt_3);
            mysqli_stmt_close($stmt_3);
          }
          break;
        case 6: // wx, qq, phone, address
          $query_3 = "UPDATE nearby_shop_info_ns SET ns_openid=?,ns_wx=?,ns_qq=?,ns_phone=?,ns_address=? WHERE ns_id=? AND (ns_certified_openid IS NULL OR ns_certified_openid=?)";
          $stmt_3 = mysqli_prepare($con, $query_3);
          mysqli_stmt_bind_param($stmt_3, "sssssis", $openid,$wx,$qq,$phone,$address,$id,$openid);
          mysqli_stmt_execute($stmt_3);
          mysqli_stmt_close($stmt_3);
          break;
        case 7: // attribute ids
          $query_3 = "UPDATE nearby_shop_info_ns SET ns_openid=?,ns_shp_att_ids=? WHERE ns_id=? AND (ns_certified_openid IS NULL OR ns_certified_openid=?)";
          $stmt_3 = mysqli_prepare($con, $query_3);
          mysqli_stmt_bind_param($stmt_3, "ssis", $openid,$att_ids,$id,$openid);
          mysqli_stmt_execute($stmt_3);
          mysqli_stmt_close($stmt_3);
          break;
        case 8: // comment/star
          $flag = false;
          $query_3 = "SELECT sus_date FROM shop_user_stars_sus WHERE sus_ns_id=".strval($id)." AND sus_openid=".sqlstr($openid);
          $result = mysqli_query($con, $query_3);
          if ($row = mysqli_fetch_array($result))
          {
            $sus_date = $row['sus_date'];
            mysqli_free_result($result);
            $now = new DateTime();
            $flag = !is_same_month(new DateTime($sus_date), $now);
            $query_3 = "UPDATE shop_user_stars_sus SET sus_date=".sqlstr($now->format('Y-m-d'))." WHERE sus_ns_id=".strval($id)." AND sus_openid=".sqlstr($openid);
            mysqli_query($con, $query_3);
          }
          else{
            $flag = true;
            $query_3 = "INSERT INTO shop_user_stars_sus (sus_ns_id,sus_openid,sus_date) VALUES (".strval($id).",".sqlstr($openid).",".sqlstr($now->format('Y-m-d')).")";
            mysqli_query($con, $query_3);
          }
          if ($flag)
          {
            $query_3 = "";
            switch ($star)
            {
              case 1:
                $query_3 = "UPDATE nearby_shop_info_ns SET ns_star_1=ns_star_1+1 WHERE ns_id=".strval($id);
                break;
              case 2:
                $query_3 = "UPDATE nearby_shop_info_ns SET ns_star_2=ns_star_2+1 WHERE ns_id=".strval($id);
                break;
              case 3:
                $query_3 = "UPDATE nearby_shop_info_ns SET ns_star_3=ns_star_3+1 WHERE ns_id=".strval($id);
                break;
              case 4:
                $query_3 = "UPDATE nearby_shop_info_ns SET ns_star_4=ns_star_4+1 WHERE ns_id=".strval($id);
                break;
              case 5:
                $query_3 = "UPDATE nearby_shop_info_ns SET ns_star_5=ns_star_5+1 WHERE ns_id=".strval($id);
                break;
            }
            else
            {
              $json = "{\"result\":0,\"error\":".$errors["already comment"]."}";
            }
            mysqli_query($con, $query_3);
          }
          break;
        case 9: // GPS latitude, longitude
          $query_3 = "SELECT ns_id FROM nearby_shop_info_ns WHERE ns_id=".strval($id)." AND ns_certified_openid=".sqlstr($openid);
          $result = mysqli_query($con, $query_3);
          if ($row = mysqli_fetch_array($result))
          {
            mysqli_free_result($result);

            $query_3 = "UPDATE nearby_shops_ns SET ns_lat=?,ns_lng=? WHERE ns_id=?";
            $stmt_3 = mysqli_prepare($con, $query_3);
            mysqli_stmt_bind_param($stmt_3, "ddi", $l_latitude,$l_longitude,$id);
            mysqli_stmt_execute($stmt_3);
            mysqli_stmt_close($stmt_3);
          }
          break;
        case 10: // shop category id
          $query_3 = "SELECT ns_id FROM nearby_shop_info_ns WHERE ns_id=".strval($id)." AND ns_certified_openid=".sqlstr($openid);
          $result = mysqli_query($con, $query_3);
          if ($row = mysqli_fetch_array($result))
          {
            mysqli_free_result($result);

            $query_3 = "UPDATE nearby_shops_ns SET ns_shp_cat_id=? WHERE ns_id=?";
            $stmt_3 = mysqli_prepare($con, $query_3);
            mysqli_stmt_bind_param($stmt_3, "ii", $cat_id,$id);
            mysqli_stmt_execute($stmt_3);
            mysqli_stmt_close($stmt_3);

            $query_3 = "UPDATE nearby_shop_info_ns SET ns_shp_att_ids=? WHERE ns_id=?";
            $stmt_3 = mysqli_prepare($con, $query_3);
            mysqli_stmt_bind_param($stmt_3, "si", $att_ids,$id);
            mysqli_stmt_execute($stmt_3);
            mysqli_stmt_close($stmt_3);
          }
          break;
        case 11: // end date - refresh
          $query_3 = "SELECT ns_end FROM nearby_shop_info_ns WHERE ns_id=".strval($id)." AND ((ns_certified_openid IS NULL AND ns_owner_openid=".sqlstr($openid).") OR ns_certified_openid=".sqlstr($openid).")";
          $result = mysqli_query($con, $query_3);
          if ($row = mysqli_fetch_array($result))
          {
            $ns_end = $row['ns_end'];
            mysqli_free_result($result);

            $ns_end = new DateTime($ns_end);

            $today = new DateTime();
            $today = new DateTime($today->format('Y-m-d'));
            if ($today < $end && $today->diff($end)->days <= 5)
            {
              $interval = new DateInterval('P1M');
              $ns_end = $ns_end->add($interval);

              $query_3 = "UPDATE nearby_shop_info_ns SET ns_end=".sqlstr($ns_end->format("Y-m-d"))." WHERE ns_id=".strval($id);
              mysqli_query($con, $query_3);
            }
          }        
          break;
        case 12: // close/shutdown
          $query_3 = "SELECT ns_openid,ns_owner_openid,ns_certified_openid,ns_start,ns_end,ns_shp_att_ids,ns_business_hours,ns_services,ns_products,ns_content,ns_free_parking,ns_free_wifi,ns_cards,ns_wx,ns_qq,ns_phone,ns_address,ns_star_5,ns_star_4,ns_star_3,ns_star_2,ns_star_1,ns_views FROM nearby_shop_info_ns WHERE ns_id=".strval($id)." AND ((ns_certified_openid IS NULL AND ns_owner_openid=".sqlstr($openid).") OR ns_certified_openid=".sqlstr($openid).")";
          $result = mysqli_query($con, $query_3);
          if ($row = mysqli_fetch_array($result))
          {
            $ns_openid = $row['ns_openid'];
            $ns_owner_openid = $row['ns_owner_openid'];
            $ns_certified_openid = $row['ns_certified_openid'];
            $ns_start = $row['ns_start'];
            $ns_end = $row['ns_end'];
            $ns_shp_att_ids = $row['ns_shp_att_ids'];
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
            $ns_star_5 = $row['ns_star_5'];
            $ns_star_4 = $row['ns_star_4'];
            $ns_star_3 = $row['ns_star_3'];
            $ns_star_2 = $row['ns_star_2'];
            $ns_star_1 = $row['ns_star_1'];
            $ns_views = $row['ns_views'];
            mysqli_free_result($result);

            $query_3 = "DELETE FROM nearby_shop_info_ns WHERE ns_id=".strval($id);
            mysqli_query($con, $query_3);

            $query_3 = "SELECT ns_lat,ns_lng,ns_shp_cat_id,ns_name,ns_restroom FROM nearby_shops_ns WHERE ns_id=".strval($id);
            $result = mysqli_query($con, $query_3);
            if ($row = mysqli_fetch_array($result))
            {
              $ns_lat = $row['ns_lat'];
              $ns_lng = $row['ns_lng'];
              $ns_shp_cat_id = $row['ns_shp_cat_id'];
              $ns_name = $row['ns_name'];
              $ns_restroom = $row['ns_restroom'];
              mysqli_free_result($result);

              $nos_enabled = 1;

              $query_3 = "DELETE FROM nearby_shops_ns WHERE ns_id=".strval($id);
              mysqli_query($con, $query_3);

              $query_3 = "INSERT INTO nearby_old_shops_nos (nos_id,nos_openid,nos_owner_openid,nos_certified_openid,nos_start,nos_end,nos_lat,nos_lng,nos_shp_cat_id,nos_name,nos_restroom,nos_enabled,nos_shp_att_ids,nos_business_hours,nos_services,nos_products,nos_content,nos_free_parking,nos_free_wifi,nos_cards,nos_wx,nos_qq,nos_phone,nos_address,nos_star_5,nos_star_4,nos_star_3,nos_star_2,nos_star_1,nos_views) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
              $stmt_3 = mysqli_prepare($con, $query_3);
              mysqli_stmt_bind_param($stmt_3, "isssssddisiisssssiiissssiiiiii", $id,$ns_openid,$ns_owner_openid,$ns_certified_openid,$ns_start,$ns_end,$ns_lat,$ns_lng,$ns_shp_cat_id,$ns_name,$ns_restroom,$nos_enabled,$ns_shp_att_ids,$ns_business_hours,$ns_services,$ns_products,$ns_content,$ns_free_parking,$ns_free_wifi,$ns_cards,$ns_wx,$ns_qq,$ns_phone,$ns_address,$ns_star_5,$ns_star_4,$ns_star_3,$ns_star_2,$ns_star_1,$ns_views);
              mysqli_stmt_execute($stmt_3);
              mysqli_stmt_close($stmt_3);
            }
          }
          break;
      }
    }
  }
  else
  {
    $json = "{\"result\":0,\"error\":".$errors["no privileges"]."}";
  }
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;


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