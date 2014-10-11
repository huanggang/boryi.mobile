<?php

/*
$openid: not null
$nickname: not null
$sex: 0: unknow, 1: male, 2: female
$subscribe: 0: not following, 1: following

$subscribe = 1, $subscribe_time != null
$subscribe = 0, $unsubscribe_time != null
*/
function add_user($openid, $nickname, $sex, $language, $city, $province, $country, $headimgurl, $subscribe, $subscribe_time, $unsubscribe_time, $unionid)
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

  $query_1 = "SELECT u_openid FROM users_u WHERE u_openid=?";
  $query_2 = "INSERT INTO users_u (u_openid, u_nickname, u_sex, u_language, u_city, u_province, u_country, u_headimgurl, u_subscribe, u_subscribe_time, u_unionid) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
  $query_3 = "UPDATE users_u SET u_nickname=?, u_sex=?, u_language=?, u_city=?, u_province=?, u_country=?, u_headimgurl=?, u_subscribe=1, u_unionid=? WHERE u_openid=?";
  $query_4 = "UPDATE users_u SET u_subscribe=0, u_unsubscribe_time=? WHERE u_openid=?";
  $query_5 = "INSERT INTO user_credits_ucr (ucr_openid) VALUES (?)"
  //mysqli_query($con, "LOCK TABLES users_u WRITE, user_credits_ucr WRITE");

  if ($stmt_1 = mysqli_prepare($con, $query_1))
  {
    mysqli_stmt_bind_param($stmt_1, "s", $openid);
    $flag = mysqli_stmt_execute($stmt_1) != false;
    if ($flag)
    {
      if ($result = mysqli_stmt_get_result($stmt_1))
      {
        if (is_null(mysqli_fetch_array($result))) // not exist
        {
          mysqli_free_result($result);
          if ($subscribe == 1) // following
          {
            if ($stmt_2 = mysqli_prepare($con, $query_2))
            {
              mysqli_stmt_bind_param($stmt_2, "ssisssssiss", $openid, $nickname, $sex, $language, $city, $province, $country, $headimgurl, $subscribe, $subscribe_time, $unionid);
              $flag = mysqli_stmt_execute($stmt_2) != false;
              mysqli_stmt_close($stmt_2);

              if ($stmt_5 = mysqli_prepare($con, $query_5))
              {
                mysqli_stmt_bind_param($stmt_5, "s", $openid);
                $flag = $flag && mysqli_stmt_execute($stmt_5) != false;
                mysqli_stmt_close($stmt_5);

              }
              else
              {
                $json = "{\"result\":0,\"error\":".$errors["internal error"]."}";
              }
            }
            else
            {
              $json = "{\"result\":0,\"error\":".$errors["internal error"]."}";
            }
          }
          else // cancel following
          {
            $json = "{\"result\":0,\"error\":".$errors["not found"]."}";
          }
        }
        else
        {
          if ($subscribe == 1) // following again
          {
            if ($stmt_3 = mysqli_prepare($con, $query_3))
            {
              mysqli_stmt_bind_param($stmt_3, "sisssssss", $nickname, $sex, $language, $city, $province, $country, $headimgurl, $unionid, $openid);
              $flag = mysqli_stmt_execute($stmt_3) != false;
              mysqli_stmt_close($stmt_3);
            }
            else
            {
              $json = "{\"result\":0,\"error\":".$errors["internal error"]."}";
            }
          }
          else // cancel following
          {
            if ($stmt_4 = mysqli_prepare($con, $query_4))
            {
              mysqli_stmt_bind_param($stmt_4, "ss", $unsubscribe_time, $openid);
              $flag = mysqli_stmt_execute($stmt_4) != false;
              mysqli_stmt_close($stmt_4);
            }
            else
            {
              $json = "{\"result\":0,\"error\":".$errors["internal error"]."}";
            }
          }
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