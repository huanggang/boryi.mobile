<?php

include_once 'util_global.php';
include_once 'util_data.php';

$openid = $_POST["oi"];
if (is_null($openid))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$id = str2int($_POST["i"]);
if ($id < 1)
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$type = str2int($_POST["t"]);
if ($type < 1 || $type > 6)
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$content = $_POST["c"];
$content = verify_string_length($content, 1, 256);
if (is_null($content))
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

//mysqli_query($con, "LOCK TABLES login_l READ, user_credits_ucr READ, complaint_nearby_jobs_cnj WRITE");
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
  // check user credits
  $query_2 = "SELECT ucr_credit FROM user_credits_ucr WHERE ucr_openid=".sqlstr($openid);
  $result = mysqli_query($con, $query_2);
  if ($row = mysqli_fetch_array($result))
  {
    $ucr_credit = $row['ucr_credit'];
    mysqli_free_result($result);
    if ($ucr_credit <= -20)
    {
      $json = "{\"result\":0,\"error\":".$errors["cannot complaint"]."}";
    }
    else
    {
      $query_3 = "SELECT cnj_id FROM complaint_nearby_jobs_cnj WHERE cnj_nj_id=".sqlstrval($id)." AND cnj_openid=".sqlstr($openid);
      $result = mysqli_query($con, $query_3);
      if ($row = mysqli_fetch_array($result))
      {
        mysqli_free_result($result);
        $json = "{\"result\":0,\"error\":".$errors["already complainted"]."}";
      }
      else
      {
        $query_4 = "SELECT COUNT(cnj_id) AS total FROM complaint_nearby_jobs_cnj WHERE cnj_nj_id=".sqlstrval($id);
        $result = mysqli_query($con, $query_4);
        if ($row = mysqli_fetch_array($result))
        {
          $total = $row['total'];
          mysqli_free_result($result);
          if ($total >= 5)
          {
            $json = "{\"result\":0,\"error\":".$errors["too many complaints"]."}";
          }
          else
          {
            $query_5 = "INSERT INTO complaint_nearby_jobs_cnj (cnj_nj_id,cnj_openid,cnj_time,cnj_type,cnj_content) VALUES (?,?,?,?,?)";
            if ($stmt = mysqli_prepare($con, $query_5))
            {
              mysqli_stmt_bind_param($stmt, "issis", $id, $openid, (new DateTime)->format("Y-m-d\TH:i:sP"), $type, $content);
              if (mysqli_stmt_execute($stmt) != false)
              {
                $json = "{\"result\":1}";
              }
              else
              {
                $json = "{\"result\":0,\"error\":".$errors["db write failure"]."}";
              }
            }
            else
            {
              $json = "{\"result\":0,\"error\":".$errors["internal error"]."}";
            }
          }
        }
      }
    }
  }
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;

?>