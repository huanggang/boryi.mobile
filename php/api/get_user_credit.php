<?php

/*
$openid: not null
*/
function get_user_credit($openid)
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

  $query_1 = "SELECT ucr_credit FROM user_credits_ucr WHERE ucr_openid=?";
 
  //mysqli_query($con, "LOCK TABLES user_credits_ucr READ");
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
          $ucr_credit = $row['ucr_credit'];

          mysqli_free_result($result);

          $json = "{\"result\":1,\"credit\":".$ucr_credit."}";
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