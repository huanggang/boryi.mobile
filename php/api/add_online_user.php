<?php
include_once '../util_global.php';
include_once '../util_data.php';

/*
$openid: not null
$latitude: not null
$longitude: not null
*/
function add_online_user($openid, $latitude, $longitude, $precision)
{
  global $db_host, $db_user, $db_pwd, $db_name, $errors;

  $now = new DateTime;
  $now = $now->format("Y-m-d\TH:i:sP");

  $con=mysqli_connect($db_host, $db_user, $db_pwd, $db_name);
  // Check connection
  if (mysqli_connect_errno())
  {
    return "{\"result\":0,\"error\":".$errors["db connection failure"]."}";
  }
  mysqli_set_charset($con, "UTF8");
  mysqli_autocommit($con, false);

  $query_1 = "SELECT l_entered, l_latitude, l_longitude, l_precision FROM login_l WHERE l_openid=?";
  $query_2 = "INSERT INTO login_history_lh (lh_openid, lh_entered, lh_latitude, lh_longitude, lh_precision) VALUES (?,?,?,?,?)";
  $query_3 = "UPDATE login_l SET l_entered=?, l_latitude=?, l_longitude=?, l_precision=? WHERE l_openid=?";
  $query_4 = "INSERT INTO login_l (l_openid, l_entered, l_latitude, l_longitude, l_precision) VALUES (?,?,?,?,?)";

  $json = null;
  //mysqli_query($con, "LOCK TABLES login_l WRITE, login_history_lh WRITE");
  if ($stmt_1 = mysqli_prepare($con, $query_1))
  {
    mysqli_stmt_bind_param($stmt_1, "s", $openid);
    if (mysqli_stmt_execute($stmt_1))
    {
      mysqli_stmt_bind_result($stmt_1, $l_entered, $l_latitude, $l_longitude, $l_precision);
      $flag = false;
      if (mysqli_stmt_fetch($stmt_1)) // already in login_l, exit abnormally last time
      {
        mysqli_stmt_close($stmt_1);
        if ($stmt_2 = mysqli_prepare($con, $query_2))
        {
          mysqli_stmt_bind_param($stmt_2, "ssddd", $openid, $l_entered, $l_latitude, $l_longitude, $l_precision);
          mysqli_stmt_execute($stmt_2);
          mysqli_stmt_close($stmt_2);
        }
        else
        {
          $json = "{\"result\":0,\"error\":".$errors["internal error"]."}";
        }

        if ($stmt_3 = mysqli_prepare($con, $query_3))
        {
          mysqli_stmt_bind_param($stmt_3, "sddds", $now, $latitude, $longitude, $precision, $openid);
          $flag = mysqli_stmt_execute($stmt_3);
          mysqli_stmt_close($stmt_3);
        }
        else
        {
          $json = "{\"result\":0,\"error\":".$errors["internal error"]."}";
        }
      }
      else // add the online user
      {
        mysqli_stmt_close($stmt_1);
        if ($stmt_4 = mysqli_prepare($con, $query_4))
        {
          mysqli_stmt_bind_param($stmt_4, "ssddd", $openid, $now, $latitude, $longitude, $precision);
          $flag = mysqli_stmt_execute($stmt_4);
          mysqli_stmt_close($stmt_4);
        }
        else
        {
          $json = "{\"result\":0,\"error\":".$errors["internal error"]."}";
        }
      }

      if ($flag)
      {
        mysqli_commit($con);
        $json = "{\"result\":1}";
      }
      else
      {
        mysqli_rollback($con);
        if (is_null($json))
        {
          $json = "{\"result\":0,\"error\":".$errors["db write failure"]."}";
        }
      }
    }
    else
    {
      mysqli_stmt_close($stmt_1);
      $json = "{\"result\":0,\"error\":".$errors["internal error"]."}";
    }
  }
  else
  {
    $json = "{\"result\":0,\"error\":".$errors["internal error"]."}";
  }

  //mysqli_query($con, "UNLOCK TABLES");
  mysqli_kill($con, mysqli_thread_id($con));
  mysqli_close($con);

  return $json;
}

?>