<?php
// -----------------------------------------------------------------------------
$_VERSION = 1.0;
$_URL_HOME = 'index.php';
$_URL_EXPIRE = 'index.php';
$_URL_MAINTENANCE = 'maintenance.html';
$_MAINTENANCE = false;

// -----------------------------------------------------------------------------
error_reporting(E_ALL ^ E_NOTICE);
mb_internal_encoding('UTF-8');
ini_set("display_errors", "On");

// -----------------------------------------------------------------------------
// 維護中
if ($_MAINTENANCE) {
    if (is_ajax_request()) die_maintenance();
    die(file_get_contents(dirname(__DIR__).'/'.$_URL_MAINTENANCE));
}

// -----------------------------------------------------------------------------
// 資料庫
$_CONFIG['db'] = array (
    'dsn'       => 'mysql:host=localhost;',
    'database'  => 'story-teller',
    'username'  => 'xxxxx',
    'password'  => 'xxxxx',
    'encoding'  => 'utf8mb4',
    'presistent'=> false,
    'page_size' => 500,
);

if ($_SERVER['HTTP_HOST']=='127.0.0.1' || $_SERVER['HTTP_HOST']=='localhost') {
    $_CONFIG['db']['dsn'] = 'mysql:host=127.0.0.1;';
}

// -----------------------------------------------------------------------------
require(__DIR__.'/db.php');
require(__DIR__.'/session.php');

// -----------------------------------------------------------------------------
// die_payload
function die_payload($code, $data=null) {
    if (session_status()==PHP_SESSION_ACTIVE) session_write_close();
    if ($data===null) die(json_encode([$code], JSON_UNESCAPED_UNICODE));
    else die(json_encode([$code, $data], JSON_UNESCAPED_UNICODE));
}

// -----------------------------------------------------------------------------
// 回傳錯誤 (code=0)
function die_error($msg=null) {die_payload(0, $msg);}
// 回傳成功 (code=1)
function die_success($data=null) {die_payload(1, $data);}
// 回傳維護中 (code=2)
function die_maintenance($url=null) {die_payload(2, $url);}
// 回傳轉址 (code=3)
function die_redirect($url=null) {die_payload(3, $url);}

// -----------------------------------------------------------------------------
// is_ajax_request
function is_ajax_request() {
    return (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH'])=='xmlhttprequest');
}

// -----------------------------------------------------------------------------
// 轉址
function redirect($url=null) {
    global $_URL_HOME;
    if ($url==null) $url=$_URL_HOME;
    if (is_ajax_request()) die_redirect($url);
    if (session_status()==PHP_SESSION_ACTIVE) session_write_close();
    header('Location: '.$url);
    die();
}

// -----------------------------------------------------------------------------
// get_request
function get_request($name, $error_msg=null, $default_value=null) {
    if (isset($_REQUEST[$name]) && !empty($_REQUEST[$name])) return $_REQUEST[$name];
    if ($error_msg!=null) die_error($error_msg);
    if (isset($_REQUEST[$name])) return $_REQUEST[$name];
    return $default_value;
}

// -----------------------------------------------------------------------------
// get_ajax_action
function get_ajax_action() {
    if (!isset($_REQUEST['action'])) die_error('action not found');
    return $_REQUEST['action'];
}

// -----------------------------------------------------------------------------
function pr($v) {
    if (is_ajax_request()) die(var_dump($v));
    echo('<br><pre>');print_r($v);echo('</pre>');
}

// -----------------------------------------------------------------------------
function now() {return date('Y-m-d H:i:s');}

//------------------------------------------------------------------------------
// check_login
function check_login($permission=[]){
    global $_URL_EXPIRE;
    if (!isset($_SESSION) ||
        !isset($_SESSION['uid']) ||
        !isset($_SESSION['permission'])) {
        redirect($_URL_EXPIRE);
    }

    if (!is_array($permission)) {
        $permission = explode(',', $permission);
    }

    //have all permission
    if (array_diff($permission, $_SESSION['permission'])) {
        redirect($_URL_EXPIRE);
    }
    return;
}

//------------------------------------------------------------------------------
// check_permission
function check_permission($permission) {
    global $_URL_EXPIRE;
    if (!isset($_SESSION) ||
        !isset($_SESSION['uid']) ||
        !isset($_SESSION['permission'])) {
        redirect($_URL_EXPIRE);
    }

    if (!is_array($permission)) { $permission = explode(',', $permission); }

    //have all permission
    if (array_diff($permission, $_SESSION['permission'])) return false;
    return true;
}


?>