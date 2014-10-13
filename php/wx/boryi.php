<?php

define("APP_PATH", realpath(dirname(dirname(__FILE__))));

require_once(APP_PATH . '/api/add_user.php');
require_once(APP_PATH . '/api/add_online_user.php');
require_once(APP_PATH . '/api/remove_online_user.php');
require_once(APP_PATH . '/api/get_user_credit.php');

/*
*   boryi_com 微信帐号
*   TOKEN: boryiwx
*
*   $config['APPID'] = "wxfade3e1184e7b528"; 
*   $config['APPSECRET'] = "187c7e895096e27ffe38cd006629834f"; 
*/
class Boryi
{
  private $logger_file = null;

  private $config = array();
  private $boryi_urls = array();
  private $access_token = null;

  public function Boryi()
  {
    $this->logger_file = APP_PATH . "/log/boryiwx.log";

    $this->config['APPID'] = "wxfade3e1184e7b528"; 
    $this->config['APPSECRET'] = "187c7e895096e27ffe38cd006629834f"; 

    $this->boryi_urls['home'] = "http://m.boryi.com/index.htm";
    $this->boryi_urls['web'] = "http://m.boryi.com/web-jobs.htm";
    $this->boryi_urls['gov'] = "http://m.boryi.com/gov-jobs.htm";
    $this->boryi_urls['cmp'] = "http://m.boryi.com/cmp-jobs.htm";
    $this->boryi_urls['redirect'] = "http://m.boryi.com/php/wx/action.php";
    $this->boryi_urls['wx'] = "http://m.boryi.com/php/wx/action.php";
    $this->boryi_urls['nearby-jobs'] = "http://m.boryi.com/nearby-jobs.htm#oi=";
    $this->boryi_urls['nearby-hires'] = "http://m.boryi.com/nearby-hires.htm#oi=";
    $this->boryi_urls['post-nearby-job'] = "http://m.boryi.com/post-nearby-job.htm#oi=";
    $this->boryi_urls['post-nearby-hire'] = "http://m.boryi.com/post-nearby-hire.htm#oi=";
  }

  /*
  * To validate the our server on WeChat server, used only once
  */
  public function valid()
  {
    //echo 'validing...';
    //valid signature , option
    if($this->checkSignature())
    {
      echo $_GET["echostr"];
      exit;
    }
  }

  /*
  * Delete menus
  */
  public function deleteMenus()
  {
    if (is_null($this->access_token))
    {
      $this->getAccessToken();
    }
    $url = 'https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=' . $this->access_token;
    $this->get($url);
  }

  /*
  * Create menus
  */
  public function createMenus()
  {
    if (is_null($this->access_token))
    {
      $this->getAccessToken();
    }
    $url = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' . $this->access_token;
    $redirect_url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' . $this->config['APPID'] . '&redirect_uri=' . urlencode($this->boryi_urls['redirect']) . '&response_type=code&scope=snsapi_base&state={STATE}#wechat_redirect';

    $data = '{"button":[
                {"name":"搜工作","sub_button":[
                  {"type":"view","name":"各人才网","url":"' . $this->boryi_urls['web'] . '"},
                  {"type":"view","name":"政府官网","url":"' . $this->boryi_urls['gov'] . '"},
                  {"type":"view","name":"名企官网","url":"' . $this->boryi_urls['cmp'] . '"},
                  {"type":"view","name":"附近招工","url":"' . str_replace("{STATE}", "n01", $redirect_url) . '"},
                  {"type":"view","name":"周边包工","url":"' . str_replace("{STATE}", "n02", $redirect_url) . '"}
                ]},
                {"name":"我发布","sub_button":[
                  {"type":"view","name":"附近招工","url":"' . str_replace("{STATE}", "n11", $redirect_url) . '"},
                  {"type":"view","name":"周边包工","url":"' . str_replace("{STATE}", "n12", $redirect_url) . '"}
                ]},
                {"name":"社区","sub_button":[
                  {"type":"click","name":"我的信用","key":"V1001_CREDITS"},
                  {"type":"location_select","name":"我的位置","key":"rselfmenu_2_0"}
                ]},
            ]}';
    $this->post($url, $data);
  }

  /*
  * Response to WeChat on action.php call
  */
  public function response()
  {
    $result_str = "";
    if (isset($GLOBALS["HTTP_RAW_POST_DATA"]))
    {
      //get post data, May be due to different environments
      $post_str = $GLOBALS["HTTP_RAW_POST_DATA"];
      //extract post data
      if (!empty($post_str))
      {
        $post_obj = simplexml_load_string($post_str, 'SimpleXMLElement', LIBXML_NOCDATA);
        $msg_type = trim($post_obj->MsgType);   //收到的消息类型

        switch ($msg_type) 
        {
          case 'event':
            $result_str = $this->eventHandle($post_obj);
            break;
          case 'text':
            $result_str = "您好，伯益网帮助信息。\n一、搜工作\n  1、各人才网：全国各人才网发布的网络招聘信息；\n  2、政府官网：各级各地政府部门在其官网发布的招聘信息；\n  3、名企官网：国内知名企业在其官网发布的招聘信息；\n  4、附近招工：附近用户发布的招工信息；\n  5、周边包工：附近用户发布的包工信息。\n二、我发布\n  1、附近招工：发布招工信息，可以被附近用户搜索；\n  2、周边包工：发布包工信息，可以被附近用户搜索。\n三、社区\n  1、我的信用：您的信用积分，决定发布信息的数量；\n  2、我的位置：手动设置您的地理位置。\n注意：搜索或发布附近招工/周边包工信息时，请您开启GPS及伯益公众号的“提供位置信息”功能，或者手动设置您的地理位置。";
            break;
          case 'location':
            $openid = $post_obj->FromUserName;
            $latitude = $post_obj->Location_X;
            $longitude = $post_obj->Location_Y;
            $precision = $post_obj->Scale;
            $this->save_user_location($openid, $latitude, $longitude, $precision);
            break;
          default:
            $result_str = "感谢您的关注。获得帮助，请发送数字0。";
            break;
        }
        $result_str = $this->responseText($post_obj, $result_str);
      }
    }
    echo $result_str;
    exit;
  }

  /*
  * Get redirect url and response header-location
  */
  public function redirect($code, $state)
  {
    $url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" . $this->config['APPID'] . "&secret=" . $this->config['APPSECRET'] . "&code=" . $code . "&grant_type=authorization_code";
    $res = $this->get($url);
    $info = json_decode($res);
    $openid = isset($info->openid) ? $info->openid : null;
    if (!is_null($openid))
    {
      $url = $this->boryi_urls['home'];
      switch ($state)
      {
        case "n01":
          $url = $this->boryi_urls['nearby-jobs'] . $openid;
          break;
        case "n02":
          $url = $this->boryi_urls['nearby-hires'] . $openid;
          break;
        case "n11":
          $url = $this->boryi_urls['post-nearby-job'] . $openid;
          break;
        case "n12":
          $url = $this->boryi_urls['post-nearby-hire'] . $openid;
          break;
      }
      header('Location: ' . $url);
    }
    else
    {
      $message = "redirect() retrived: " . $res;
      $this->log($message);
    }
  }

  /*
  * Verify message is from WeChat server
  */
  private function checkSignature()
  {
    $signature = $_GET["signature"];
    $timestamp = $_GET["timestamp"];
    $nonce = $_GET["nonce"];    
            
    $token = TOKEN;
    $tmpArr = array($token, $timestamp, $nonce);
    sort($tmpArr, SORT_STRING);
    $tmpStr = implode( $tmpArr );
    $tmpStr = sha1( $tmpStr );

    return $tmpStr == $signature;
  }

  /*
  * 获取微信access_token  
  */
  private function getAccessToken()
  {
    // http请求方式: GET
    // https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
    $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" . $this->config['APPID'] . "&secret=" . $this->config['APPSECRET'];
    $info = json_decode($this->get($url));
    $this->access_token = $info->access_token;
  }

  /*
  * HTTP GET
  */
  private function get($url)
  {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $content = curl_exec($curl);
    curl_close($curl);
    return $content;
  }

  /*
  * HTTP POST
  */
  private function post($url, $data)
  {
    $curl = curl_init();
    curl_setopt_array(
      $curl,
      array(
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $data
      )
    );
    $content = curl_exec($curl);
    curl_close($curl);
    return $content;
  }
    
  /**
   * 处理推送事件
   */
  private function eventHandle($post_obj)
  {
    $content = "";
    $openid = $post_obj->FromUserName;
    switch ($post_obj->Event)
    {
      case "subscribe":
        $content = "感谢您关注伯益网公众号。\n全国招聘，一网搜尽。\n发送信息，获得帮助。\n点击菜单，获取信息。";
        // get user info and add user
        $this->save_user_info($openid);
        break;
      case "unsubscribe":
        // remove user
        $time = date('Y-m-d H:i:s');
        $res = add_user($openid, null, null, null, null, null, null, null, 0, null, $time, null);
        $info = json_decode($res);
        if (!is_null($info))
        {
          if ($info->result == 0)
          {
            $message = "add_user() error code: " . strval($info->error) . " add_user(\"".$openid."\",null,null,null,null,null,null,null,0,null,\"".$time."\",null)";
            $this->log($message);
          }
        }
        else
        {
          $message = "add_user() returned: " . $res;
          $this->log($message);
        }
        // remove online user
        $res = remove_online_user($openid);
        $info = json_decode($res);
        if (!is_null($info))
        {
          if ($info->result == 0)
          {
            $message = "remove_online_user() error code: " . strval($info->error) . " remove_online_user(\"".$openid."\")";
            $this->log($message);
          }
        }
        else
        {
          $message = "remove_online_user() returned: " . $res;
          $this->log($message);
        }

        break;
      case "LOCATION":
        $latitude = $post_obj->Latitude;
        $longitude = $post_obj->Longitude;
        $precision = $post_obj->Precision;
        $this->save_user_location($openid, $latitude, $longitude, $precision);
        break;
      case "CLICK":
        switch ($post_obj->EventKey)
        {
          case 'V1001_CREDITS':
            // show user credits
            $res = get_user_credit($openid);
            $info = json_decode($res);
            if (!is_null($info))
            {
              if ($info->result == 0)
              {
                $message = "get_user_credit() error code: " . strval($info->error) . " get_user_credit(\"".$openid."\")";
                $this->log($message);
              }
              else
              {
                $credit = $info->credit;
                $content = '您的信用积分：' . $credit . "\n";
                $txt = "";
                if ($credit >= 400)
                {
                  $txt = "恭喜您，您可无限制发布招工或包工信息。";
                }
                else if ($credit >= 150)
                {
                  $txt = "每个月您能发布五条招工或包工信息。";
                }
                else if ($credit >= 50)
                {
                  $txt = "每个月您能发布两条招工或包工信息。";
                }
                else if ($credit >= 0)
                {
                  $txt = "每个月您能发布一条招工或包工信息。\n请您举报虚假非法招工或包工信息，获取积分。";
                }
                else
                {
                  $txt = "很遗憾，你不可以发布招或包工信息。";
                }
                $content = $content . $txt;
              }
            }
            else
            {
              $message = "get_user_credit() returned: " . $res;
              $this->log($message);
            }
            break;
        }
        break;
      case "VIEW":
        break;
      case "location_select":
        $location_info = $post_obj->SendLocationInfo;
        $latitude = $location_info->Location_X;
        $longitude = $location_info->Location_Y;
        $precision = $location_info->Scale;
        $this->save_user_location($openid, $latitude, $longitude, $precision);
        break;
      default :
        break;
    }
    return $content;
  }

  /*
  * Format response-text for WeChat
  */
  private function responseText($object, $content)
  {
    $text_tpl = 
      "<xml>
        <ToUserName><![CDATA[%s]]></ToUserName>
        <FromUserName><![CDATA[%s]]></FromUserName>
        <CreateTime>%s</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[%s]]></Content>
      </xml>";
    return sprintf($text_tpl, $object->FromUserName, $object->ToUserName, time(), $content);
  }

  private function log($message)
  {
    $content = date('Y-m-d H:i:s') . " " . $message . "\n";
    file_put_contents($this->logger_file, $content, FILE_APPEND);
  }

  /*
  * get the open id of the target user 
  */
  private function save_user_info($openid)
  {
    $continue = true;
    $retry = 0;
    while ($continue && $retry < 3)
    {
      $this->getAccessToken(); 
      $url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token=" . $this->access_token . "&openid=" . $openid . "&lang=zh_CN";
      $res = $this->get($url);
      $info = json_decode($res);
      $continue =  is_null($info) || isset($info->errcode);
      $retry++;
    }

    $subscribe = isset($info->subscribe) ? $info->subscribe : null;
    $openid = isset($info->openid) ? $info->openid : null;
    $nickname = isset($info->nickname) ? $info->nickname : null;
    $sex = isset($info->sex) ? $info->sex : null;
    $city = isset($info->city) ? $info->city : null;
    $country = isset($info->country) ? $info->country : null;
    $province = isset($info->province) ? $info->province : null;
    $language = isset($info->language) ? $info->language : null;
    $headimgurl = isset($info->headimgurl) ? $info->headimgurl : null;
    $subscribe_time = isset($info->subscribe_time) ? $info->subscribe_time : null;
    $unionid = isset($info->unionid) ? $info->unionid : null;

    if (!is_null($subscribe) && !is_null($openid))
    {
      $res = add_user($openid, $nickname, $sex, $language, $city, $province, $country, $headimgurl, $subscribe, $subscribe_time, null, $unionid);

      $info = json_decode($res);
      if (!is_null($info))
      {
        if ($info->result == 0)
        {
          $message = "add_user() error code: " . strval($info->error) . " add_user(\"".$openid."\",\"".$nickname."\",".$sex.",\"".$language."\",\"".$city."\",\"".$province."\",\"".$country."\",\"".$headimgurl."\",".$subscribe.",\"".$subscribe_time."\",null,\"".$unionid."\")";
          $this->log($message);
        }
      }
      else
      {
        $message = "add_user() returned: " . $res;
        $this->log($message);
      }
    }
    else 
    {
      $message = "save_user_info() retrieved: " . $res;
      $this->log($message);
    }
  }

  /*
  * Save user location
  */
  private function save_user_location($openid, $latitude, $longitude, $precision)
  {
    // add online user
    $res = add_online_user($openid, $latitude, $longitude, $precision);
    $info = json_decode($res);
    if (!is_null($info))
    {
      if ($info->result == 0)
      {
        $message = "add_online_user() error code: " . strval($info->error) . " add_online_user(\"".$openid."\",".$latitude.",".$longitude.",".$precision.")";
        $this->log($message);
      }
    }
    else
    {
      $message = "add_online_user() returned: " . $res;
      $this->log($message);
    }
  }
}