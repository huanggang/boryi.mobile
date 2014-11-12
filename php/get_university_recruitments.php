<?php

include_once 'util_global.php';
include_once 'util_data.php';

$openid = isset($_POST["oi"]) ? $_POST["oi"] : null;
if (is_null($openid))
{
  echo "{\"result\":0,\"error\":".$errors["missing params"]."}";
  exit;
}
$page = isset($_POST["p"]) ? str2int($_POST["p"]) : 1;
if ($page <= 0)
{
  $page = 1;
}

$con=mysqli_connect($db_host, $db_user, $db_pwd, $db_name);
// Check connection
if (mysqli_connect_errno())
{
  echo "{\"result\":0,\"error\":".$errors["db connection failure"]."}";
  exit;
}
mysqli_set_charset($con, "UTF8");

$u_unv_id = null;
$total = 0;
$recruitments = "";
$json = null;

//mysqli_query($con, "LOCK TABLES users_u READ, university_recruitments_unv_rcr READ, university_companies_unv_cmp READ");
// check if user is belong to any university
$query_1 = "SELECT u_unv_id FROM users_u WHERE u_openid=".sqlstr($openid);
$result = mysqli_query($con, $query_1);
if ($row = mysqli_fetch_array($result))
{
  $u_unv_id = $row['u_unv_id'];
  mysqli_free_result($result);
}
if (is_null($u_unv_id))
{
  $json = "{\"result\":0,\"error\":".$errors["not from university"]."}";
}

if (is_null($json))
{
  $total = 0;
  if ($page == 1) // first page query total
  {
    $query_1 = "SELECT COUNT(*) AS total FROM university_recruitments_unv_rcr WHERE unv_rcr_unv_id=".sqlstrval($u_unv_id);
    $result = mysqli_query($con, $query_1);
    if ($row = mysqli_fetch_array($result))
    {
      $total = $row['total'];
      mysqli_free_result($result);
    }
  }
  if ($page > 1 || $total > 0)
  {
    $max = $per_page * $max_pages;
    $start = ($page - 1) * $per_page;
    if ($max > $start)
    {
      $query_1 = "SELECT unv_rcr_date, unv_rcr_unv_cmp_id, unv_rcr_place, unv_cmp_name FROM university_recruitments_unv_rcr LEFT JOIN university_companies_unv_cmp ON unv_rcr_unv_cmp_id=unv_cmp_id WHERE unv_rcr_unv_id=".sqlstrval($u_unv_id)." ORDER BY unv_rcr_date DESC LIMIT ".sqlstrval($start).",".sqlstrval($per_page);
      $result = mysqli_query($con, $query_1);
      while ($row = mysqli_fetch_array($result))
      {
        $unv_rcr_date = $row['unv_rcr_date'];
        $unv_rcr_unv_cmp_id = $row['unv_rcr_unv_cmp_id'];
        $unv_rcr_place = $row['unv_rcr_place'];
        $unv_cmp_name = $row['unv_cmp_name'];

        $recruitments = $recruitments.",{\"i\":".jsonstrval($unv_rcr_unv_cmp_id).",\"n\":".jsonstr($unv_cmp_name).",\"d\":".jsonstr($unv_rcr_date).",\"p\":".jsonstr($unv_rcr_place)."}";
      }
      mysqli_free_result($result);
      if (strlen($recruitments) > 0)
      {
        $recruitments = substr($recruitments, 1);
      }
    }
  }
  
  $json = "{\"t\":".$total.",\"r\":[".$recruitments."]}";
}
//mysqli_query($con, "UNLOCK TABLES");

mysqli_kill($con, mysqli_thread_id($con));
mysqli_close($con);

echo $json;

?>