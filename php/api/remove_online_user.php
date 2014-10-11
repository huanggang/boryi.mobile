<?php

/*
$openid: not null
*/
function remove_online_user($openid)
{
  include_once '../util_global.php';
  include_once '../util_data.php';

  $con=mysqli_connect($db_host, $db_user, $db_pwd, $db_name);
  // Check connection
  if (mysqli_connect_errno())
  {
    return "{\"result\":0,\"error\":".$errors["db connection failure"]."}";
  }
  mysqli_set_charset($con, "UTF8");
  mysqli_autocommit($con, false);

  $json = "{\"result\":1}";

  $query_1 = "SELECT l_entered, l_latitude, l_longitude, l_precision FROM login_l WHERE l_openid=?";
  $query_2 = "INSERT INTO login_history_lh (lh_openid, lh_entered, lh_latitude, lh_longitude, lh_precision) VALUES (?,?,?,?,?)";
  $query_3 = "DELETE FROM login_l WHERE l_openid=?";
 
  //mysqli_query($con, "LOCK TABLES login_l WRITE, login_history_lh WRITE");
  if ($stmt_1 = mysqli_prepare($con, $query_1))
  {
    mysqli_stmt_bind_param($stmt_1, "s", $openid);
    $flag = mysqli_stmt_execute($stmt_1) != false;
    if ($flag)
    {
      if ($result = mysqli_stmt_get_result($stmt_1))
      {
        if ($row = mysqli_fetch_array($result))
        {
          $l_entered = $row['l_entered'];
          $l_latitude = $row['l_latitude'];
          $l_longitude = $row['l_longitude'];
          $l_precision = $row['l_precision'];

          mysqli_free_result($result);

          if ($stmt_2 = mysqli_prepare($con, $query_2))
          {
            mysqli_stmt_bind_param($stmt_2, "sssss", $openid, $l_entered, $l_latitude, $l_longitude, $l_precision);
            $flag = mysqli_stmt_execute($stmt_2) != false;
            mysqli_stmt_close($stmt_2);

            if ($stmt_3 = mysqli_prepare($con, $query_3))
            {
              mysqli_stmt_bind_param($stmt_3, "s", $openid);
              $flag = $flag && mysqli_stmt_execute($stmt_3) != false;
              mysqli_stmt_close($stmt_3);
            }
            else
            {
              $json = "{\"result\":0,\"error\":".$errors["internal error"]."}";
            }

            if ($flag)
            {
              mysqli_commit($con);
            }
            else
            {
              mysqli_rollback($con);
              $json = "{\"result\":0,\"error\":".$errors["db write failure"]."}";
            }
          }
          else
          {
            $json = "{\"result\":0,\"error\":".$errors["internal error"]."}";
          }
        }
        else
        {
          $json = "{\"result\":0,\"error\":".$errors["not found"]."}";
        }
      }
      else
      {
        $json = "{\"result\":0,\"error\":".$errors["db read failure"]."}";
      }
    }
    else
    {
      $json = "{\"result\":0,\"error\":".$errors["internal error"]."}";
    }
    mysqli_stmt_close($stmt_1);
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