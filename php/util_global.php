<?php

// database
$db_host = "localhost";
$db_user = "bnj";
$db_pwd = "P@ssw0rd#2014";
$db_name = "boryi_nearby_jobs";

// products displaying / listing
$max_pages = 50;
$per_page = 20;

// distance
$distance_min = 2;
$distance_max = 5;
$distance_step = 1;

// photo
$max_photo_size = 524288; // 500KB
$dir_photo = "upload/news/img/"; 

// convert string to interger with default value
function str2int($str, $default = 0)
{
  if (is_null($str) || strlen($str) == 0)
  {
    $value = $default;
  }
  else
  {
    $value = intval($str);
  }
  return $value;
}

// convert string to float with default value
function str2float($str, $default = 0)
{
  if (is_null($str) || strlen($str) == 0)
  {
    $value = $default;
  }
  else
  {
    $value = floatval($str);
  }
  return $value;
}

// convert string to datetime with default value
function str2datetime($str, $default = null)
{
  if (!is_null($str) && strlen($str) != 0)
  {
    try
    {
      $value = new DateTime($str);
    }
    catch (Exception $e)
    {
      $value = $default;
    }
  }
  else
  {
    $value = $default;
  }
  return $value;
}

function unixtimestamp2datetimestr($timestamp)
{
  $datetime = new DateTime();
  $timestamp = $datetime->setTimestamp($timestamp);
  return $timestamp->format('Y-m-d\TH:i:sP');
}

function jsonstr($str)
{
  return (is_null($str) || empty($str)) ? "null" : "\"".str_replace("\"", "\\\"", str_replace("\r", "", str_replace("\n", "<br/>", $str)))."\"";
}

function jsonstrval($val)
{
  return is_null($val) ? "null" : strval($val);
}

function sqlstr($str)
{
  return (is_null($str) || empty($str)) ? "null" : "'".str_replace("'", "\\'", $str)."'";
}

function sqlstrval($val)
{
  return is_null($val) ? "null" : strval($val);
}

function downgrade_credit($credit)
{
  if ($credit >= 400)
  {
    $credit = 150;
  }
  else if ($credit >= 150)
  {
    $credit = 50;
  }
  else if ($credit >= 50)
  {
    $credit = 0;
  }
  else if ($credit >= 10)
  {
    $credit = -1;
  }
  else
  {
    $credit -= 10;
  }
  return $credit;
}

//$table = "nearby_jobs_nj"
//$columns = "nj_id,nj_lat,nj_lng";
function get_geo_distance_query($table, $columns, $column_lat, $column_lng, $latitude, $longitude, $conditions, $distance, $number)
{
  $radius = 6378.137; // kilometers
  $diameter = 2 * $radius;
  $factor1 = pi() / 180;
  $factor2 = $factor1 / 2;
  $factor3 = $factor1 * $radius;
  $factor4 = $distance / $factor3;
  $factor5 = $factor4 / abs(cos(deg2rad($latitude)));

  $lat1 = $latitude - $factor4;
  $lat2 = $latitude + $factor4;
  $lng1 = $longitude - $factor5;
  $lng2 = $longitude + $factor5;

  $query = "SELECT ".$columns.",";

  $query = $query.$diameter."*ASIN(SQRT(POWER(SIN((".$latitude."-".$column_lat.")*".$factor2."),2)+COS(".$latitude."*".$factor1.")*COS(".$column_lat."*".$factor1.")*POWER(SIN((".$longitude."-".$column_lng.")*".$factor2."),2)))";

  $query = $query." AS distance FROM ".$table." WHERE ";

  $query = $query.$column_lat." BETWEEN ".$lat1." AND ".$lat2;
  $query = $query." AND ".$column_lng." BETWEEN ".$lng1." AND ".$lng2;

  if (!is_null($conditions))
  {
    $query = $query.$conditions;
  }

  $query = $query." HAVING distance<".$distance." ORDER BY distance";
  if (!is_null($number) && $number > 0)
  {
    $query = $query." LIMIT ".$number;
  }

  return $query;
}

function format_wxs($wxs)
{
  if (is_null($wxs))
  {
    return null;
  }
  $wxs = preg_split("/[^\d\w\-_]+/", $wxs);
  $value = "";
  for ($i = 0; $i < sizeof($wxs); $i++)
  {
    if (is_valid_wx($wxs[$i]))
    {
      $value = $value.",".$wxs[$i];
    }
  }
  if (strlen($value) == 0)
  {
    return null;
  }
  return substr($value, 1);
}

function is_valid_wx($wx)
{
  $pattern = "/^\w[\d\w\-_]{5,19}$/";
  return (preg_match($pattern, $wx) == 1);
}

function format_qqs($qqs)
{
  if (is_null($qqs))
  {
    return null;
  }
  $qqs = preg_split("/[^\d]+/", $qqs);
  $value = "";
  for ($i = 0; $i < sizeof($qqs); $i++)
  {
    if (is_valid_qq($qqs[$i]))
    {
      $value = $value.",".$qqs[$i];
    }
  }
  if (strlen($value) == 0)
  {
    return null;
  }
  return substr($value, 1);
}

function is_valid_qq($qq)
{
  $pattern = "/^\d{4,12}$/";
  return (preg_match($pattern, $qq) == 1);
}

function format_phones($phones)
{
  if (is_null($phones))
  {
    return null;
  }
  $phones = preg_split("/[^\d]+/", $phones);
  $value = "";
  for ($i = 0; $i < sizeof($phones); $i++)
  {
    if (is_valid_mobile($phones[$i]) || is_valid_phone($phones[$i]))
    {
      $value = $value.",".$phones[$i];
    }
  }
  if (strlen($value) == 0)
  {
    return null;
  }
  return substr($value, 1);
}

function is_valid_mobile($mobile)
{
  $pattern = "/^1(3|4|5|7|8)\d{9}$/";
  return (preg_match($pattern, $mobile) == 1);
}

function is_valid_phone($phone)
{
  $pattern = "/^\d{7,8}$/";
  return (preg_match($pattern, $phone) == 1);
}

function format_emails($emails)
{
  if (is_null($emails))
  {
    return null;
  }
  $emails = preg_split("/[\s,，]+/", $emails);
  $value = "";
  for ($i = 0; $i < sizeof($emails); $i++)
  {
    if (is_valid_email($emails[$i]))
    {
      $value = $value.",".$emails[$i];
    }
  }
  if (strlen($value) == 0)
  {
    return null;
  }
  return substr($value, 1);
}

function is_valid_email($email)
{
  $pattern = "/^[_a-z0-9\-]+(\.[_a-z0-9\-]+)*@[a-z0-9\-]+(\.[a-z0-9\-]+)*(\.[a-z]{2,4})$/";
  return (preg_match($pattern, $email) == 1);
}

function verify_string_length($value, $min, $max)
{
  if (is_null($value))
  {
    return null;
  }
  $value = strip_tags($value);
  $length = strlen($value);
  if ($length < $min)
  {
    return null;
  }
  if ($length > $max)
  {
    return substr($value, 0, $max);
  }
  return $value;
}

function is_same_month($date1, $date2)
{
  return ((str2int($date1->format("Y")) == str2int($date2->format("Y"))) && (str2int($date1->format("m")) == str2int($date2->format("m"))));
}

function get_illegal_words($res)
{
  $words = ",\"words\":[\"" . implode("\",\"", $res) . "\"]";
  return $words;
}

function get_cat_level($id)
{
  $level = 3;
  $max = 3;
  $step = 100;
  for ($i = 2; $i > 0; $i--)
  {
    $delta = pow($step, ($max - $i));
    $value = intval(floor($id / $delta) * $delta);
    if ($value == $id)
    {
      $level = $i;
    }
    else
    {
      break;
    }
  }
  return $level;
}

?>