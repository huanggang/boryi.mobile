<?php 

define(TOKEN, "boryiwx");
require_once("boryi.php");

$b = new Boryi();

if (isset($_GET['echostr']))
{
  $b->valid();
}
else if (isset($_GET['menus']))
{
  $b->deleteMenus();
  $b->createMenus();
}
else if (isset($_GET['code']))
{
  $code = $_GET['code'];
  $state = $_GET['state'];
  $b->redirect($code, $state);
}
else
{
  $b->response();
}

?>