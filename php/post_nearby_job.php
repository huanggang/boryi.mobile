<?php
//function post_nearby_job($openid, $end, $title, $type, $sex, $age_low, $age_high, $height_low, $height_high, $education, $experience, $salary_low, $salary_high, $social_security, $housing_fund, $annual_vacations, $housing, $meals, $no_travel, $no_overtime, $no_nightshift, $requirement, $description, $benefit, $company, $phone, $email, $address){

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
$title = $_POST['t'];
$title = verify_string_length($title, 2, 32);
if (is_null($title))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
else
{
  $res = ac_match($title);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
}
$type = str2int($_POST['ty']);
if ($type <= 0)
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
else if (!is_valid_type($type))
{
  echo "{\"result\":0,\"error\":".$errors["invalid type"]."}";
  exit;
}
$sex = format_boolean(str2int($_POST['sx'], -1));
$age_low = str2int($_POST['al']);
if ($age_low <= 0)
{
  $age_low = null;
}
$age_high = str2int($_POST['ah']);
if ($age_high <= 0)
{
  $age_high = null;
}
if (!is_valid_age($age_low, $age_high))
{
  echo "{\"result\":0,\"error\":".$errors["invalid age"]."}";
  exit;
}
$height_low = str2int($_POST['hl']);
if ($height_low <= 0)
{
  $height_low = null;
}
$height_high = str2int($_POST['hh']);
if ($height_high <= 0)
{
  $height_high = null;
}
if (!is_valid_height($height_low, $height_high))
{
  echo "{\"result\":0,\"error\":".$errors["invalid height"]."}";
  exit;
}
$education = str2int($_POST['edu']);
if ($education <= 0)
{
  $education = null;
}
else if (!is_valid_education($education))
{
  echo "{\"result\":0,\"error\":".$errors["invalid education"]."}";
  exit;
}
$experience = str2int($_POST['exp'], -1);
if ($experience < 0)
{
  $experience = null;
}
else if (!is_valid_experience($experience))
{
  echo "{\"result\":0,\"error\":".$errors["invalid experience"]."}";
  exit;
}
$salary_low = str2int($_POST['sl']);
if ($salary_low <= 0)
{
  $salary_low = null;
}
$salary_high = str2int($_POST['sh']);
if ($salary_high <= 0)
{
  $salary_high = null;
}
if (!is_valid_salary($salary_low, $salary_high))
{
  echo "{\"result\":0,\"error\":".$errors["invalid salary"]."}";
  exit;
}
$social_security = format_boolean(str2int($_POST['ss'], -1));
$housing_fund = format_boolean(str2int($_POST['hf'], -1));
$annual_vacations = format_boolean(str2int($_POST['av'], -1));
$housing = format_boolean(str2int($_POST['hs'], -1));
$meals = format_boolean(str2int($_POST['ml'], -1));
$no_travel = format_boolean(str2int($_POST['tr'], -1));
$no_overtime = format_boolean(str2int($_POST['ot'], -1));
$no_nightshift = format_boolean(str2int($_POST['ns'], -1));
$requirement = $_POST['rqr'];
$requirement = verify_string_length($requirement, 1, 512);
if (!is_null($requirement))
{
  $res = ac_match($requirement);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
}
$description = $_POST['dsc'];
$description = verify_string_length($description, 4, 512);
if (is_null($description))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
else
{
  $res = ac_match($description);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
}
$benefit = $_POST['bnf'];
$benefit = verify_string_length($benefit, 1, 512);
if (!is_null($benefit))
{
  $res = ac_match($benefit);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
}
$company = $_POST['c'];
$company = verify_string_length($company, 2, 64);
if (is_null($company))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
else
{
  $res = ac_match($company);
  if (!is_null($res) && sizeof($res) > 0)
  {
    echo "{\"result\":0,\"error\":".$errors["illegal words"].get_illegal_words($res)."}";
    exit;
  }
}
$phone = $_POST['phn'];
$phone = verify_string_length($phone, 7, 64);
$phone = format_phones($phone);
$email = $_POST['eml'];
$email = verify_string_length($email, 7, 64);
$email = format_emails($email);
$address = $_POST['add'];
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

//mysqli_query($con, "LOCK TABLES login_l READ, user_credits_ucr WRITE, nearby_job_info_nj WRITE, nearby_jobs_nj WRITE");
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
  $query_2 = "SELECT ucr_credit, ucr_job_start, ucr_job_count FROM user_credits_ucr WHERE ucr_openid=".sqlstr($openid);
  $result = mysqli_query($con, $query_2);
  if ($row = mysqli_fetch_array($result))
  {
    $ucr_credit = $row['ucr_credit'];
    $ucr_job_start = $row['ucr_job_start'];
    $ucr_job_count = $row['ucr_job_count'];
    mysqli_free_result($result);
    if ($ucr_credit < 0)
    {
      $json = "{\"result\":0,\"error\":".$errors["cannot post due to low credits"]."}";
    }
    else
    {
      if (!is_null($ucr_job_start) && is_same_month(new DateTime($ucr_job_start), $now))
      {
        if (($ucr_credit >= 400) // no limit
          || ($ucr_credit >= 150 && $ucr_job_count < 5) // max 5
          || ($ucr_credit >= 50 && $ucr_job_count < 2)) // max 2
        {
          $ucr_job_count++;
          $query_3 = "UPDATE user_credits_ucr SET ucr_job_count=".sqlstrval($ucr_job_count)." WHERE ucr_openid=".sqlstr($openid);
          mysqli_query($con, $query_3);
        }
        else
        {
          $json = "{\"result\":0,\"error\":".$errors["cannot post due to over limits"]."}";
        }
      }
      else
      {
        $query_3 = "UPDATE user_credits_ucr SET ucr_job_start=".sqlstr($now->format('Y-m-d')).", ucr_job_count=1 WHERE ucr_openid=".sqlstr($openid);
        mysqli_query($con, $query_3);
      }

      if (is_null($json))
      {
        $id = 0;

        $query_4 = "INSERT INTO nearby_job_info_nj (nj_openid,nj_start,nj_end,nj_title,nj_type,nj_sex,nj_age_l,nj_age_h,nj_height_l,nj_height_h,nj_edu,nj_exp,nj_salary_l,nj_salary_h,nj_social_security,nj_housing_fund,nj_annual_vacations,nj_housing,nj_meals,nj_travel,nj_overtime,nj_nightshift,nj_requirement,nj_description,nj_benefit,nj_company,nj_phone,nj_email,nj_address) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        $query_5 = "SELECT last_insert_id() AS id";
        $query_6 = "INSERT INTO nearby_jobs_nj (nj_id,nj_lat,nj_lng) VALUES (?,?,?)";

        $stmt_4 = mysqli_prepare($con, $query_4);
        $stmt_6 = mysqli_prepare($con, $query_6);

        mysqli_stmt_bind_param($stmt_4, "ssssiiiiiiiiiiiiiiiiiisssssss", $openid,$now->format("Y-m-d H:i:s"),$end->format("Y-m-d"),$title,$type,$sex,$age_low,$age_high,$height_low,$height_high,$education,$experience,$salary_low,$salary_high,$social_security,$housing_fund,$annual_vacations,$housing,$meals,$no_travel,$no_overtime,$no_nightshift,$requirement,$description,$benefit,$company,$phone,$email,$address);
        mysqli_stmt_bind_param($stmt_6, "idd", $id,$l_latitude,$l_longitude);

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
  $today = (new DateTime)->format('Y-m-d');
  $today = new DateTime($today);
  $days = $today->diff($end)->days;
  return (($end > $today) && ($days <= 30) && ($days >= 5));
}

function is_valid_age($age_low, $age_high)
{
  $flag = ((is_null($age_low) || ($age_low >= 16 && $age_low <= 80)) 
    && (is_null($age_high) || ($age_high >= 16 && $age_high <= 80)));

  if ($flag && !is_null($age_low) && !is_null($age_high))
  {
    $flag = $age_low <= $age_high;
  }

  return $flag;
}

function is_valid_height($height_low, $height_high)
{
  $flag = ((is_null($height_low) || ($height_low >= 70 && $height_low <= 250)) 
    && (is_null($height_high) || ($height_high >= 70 && $height_high <= 250)));

  if ($flag && !is_null($height_low) && !is_null($height_high))
  {
    $flag = $height_low <= $height_high;
  }

  return $flag;
}

function is_valid_salary($salary_low, $salary_high)
{
  $flag = ((is_null($salary_low) || ($salary_low >= 500 && $salary_low <= 999999)) 
    && (is_null($salary_high) || ($salary_high >= 500 && $salary_high <= 999999)));

  if ($flag && !is_null($salary_low) && !is_null($salary_high))
  {
    $flag = $salary_low <= $salary_high;
  }

  return $flag;
}

function is_valid_type($type)
{
  return (is_null($type) || ($type >= 1 && $type <= 5));
}

function is_valid_education($education)
{
  return (is_null($education) || ($education >= 1 && $education <= 6));
}

function is_valid_experience($experience)
{
  return (is_null($experience) || ($experience >= 0 && $experience <= 60));
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

?>