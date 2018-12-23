<?php
require(__DIR__.'/../_lib/init.php');
$action = get_ajax_action();

if ($action == 'login') {
	login();
	die();
}

check_login();

if ($action=='insert')
	insert();
else if ($action=='set_admin')
	set_admin();
else if ($action=='unset_admin')
	unset_admin();
else if ($action=='suspend')
	suspend();
else if ($action=='reactivate')
	reactivate();
else if ($action=='admin_change_pwd')
	admin_change_pwd();
else if ($action=='set_info')
	set_info();
die();

//------------------------------------------------------------------------------
function login(){
	$account = get_request('account', 'account 為必要欄位');
    $password = get_request('password', 'password 為必要欄位');

	$rs = db()->query('SELECT `id`, `password`, `status`, `permission` FROM `user` WHERE `account`=:account LIMIT 1', $account);

	if (count($rs->data)==0) die_error('帳號: '.$account.' 不存在');
	if ($rs->password!=md5($password)) die_error('密碼錯誤');
	if ($rs->status!=1) die_error('帳號已停權, 請洽管理人員');

	$_SESSION['uid'] = intval($rs->id);
	$_SESSION['permission'] = [];
	if (isset($rs->permission)) { $_SESSION['permission'] = explode(',', $rs->permission); }

	die_success();
}

function insert(){
	if (!check_permission('admin')) die_error('no_permission');
	
	$account = get_request('account', 'account 為必要欄位');
	$password = get_request('password', 'password 為必要欄位');
	$permission = get_request('permission');
	$email = get_request('email');

	check_account($account);
	check_password($password);
	check_email($email);

	$id = db()->insert('user', [
		'account'=>$account,
		'password'=>md5($password),
		'permission'=>$permission,
		'email'=>$email,
		'status'=>1
	]);
	
	die_success();
}

function set_admin(){
	if (!check_permission('admin')) die_error('no_permission');
	$uid = get_request('uid');
	add_permission($uid, 'admin');
	die_success();
}

function unset_admin(){
	if (!check_permission('admin')) die_error('no_permission');
	$uid = get_request('uid');
	
	//check if last admin
	$admin = [];
	$rs = db()->query('SELECT `id` FROM `user` WHERE `permission` LIKE "%admin%"');
	foreach ($rs->data as $r) { array_push($admin, $r->id); }
	if (count($admin)<=1 && in_array($uid, $admin)) die_error('取消此管理員將導致系統鎖死.');

	remove_permission($uid, 'admin');
	die_success();
}

function suspend(){
	if (!check_permission('admin')) die_error('no_permission');

	$uid = get_request('uid');

	//check if last admin
	$admin = [];
	$rs = db()->query('SELECT `id` FROM `user` WHERE `permission` LIKE "%admin%"');
	foreach ($rs->data as $r) { array_push($admin, $r->id); }
	if (count($admin)<=1 && in_array($uid, $admin)) die_error('停用此管理員將導致系統鎖死.');

	db()->update('user', 'id=:id',[
		'id'=>$uid,
		'status'=>0
	]);
	die_success();
}

function reactivate(){
	if (!check_permission('admin')) die_error('no_permission');

	$uid = get_request('uid');
	db()->update('user', 'id=:id',[
		'id'=>$uid,
		'status'=>1
	]);
	die_success();
}

function admin_change_pwd(){
	if (!check_permission('admin')) die_error('no_permission');

	$uid = get_request('uid');
	$password = get_request('password');

	db()->update('user', 'id=:id',[
		'id'=>$uid,
		'password'=>md5($password)
	]);
	die_success();
}

function set_info(){
	$password = get_request('password', '原密碼為必要欄位');
	$account = get_request('account');
	$email = get_request('email');
	$new_password = get_request('new_password');
	$confirm_password = get_request('confirm_password');

	$rs = db()->query('SELECT `password` FROM `user` WHERE `id`=:id', $_SESSION['uid']);
	if ($rs->password!=md5($password)) die_error('密碼錯誤');

	$data['id'] = $_SESSION['uid'];

	if (isset($account)) {
		check_account($account);
		$data['account'] = $account;
	}
	if (isset($email)) {
		check_email($email);
		$data['email'] = $email;
	}
	if (isset($new_password)) {
		if ($new_password!=$confirm_password) die_error('密碼不一致');
		check_password($new_password);
		$data['password'] = md5($new_password);
	}

	db()->update('user', 'id=:id', $data);
	die_success();
}

//------------------------------------------------------------------------------
function check_account($account){
	if (!ctype_alnum($account)) die_error('帳號只可輸入英文或數字, 大小寫有別.');

	$rs = db()->query('SELECT EXISTS(SELECT 1 FROM `user` WHERE `account`=:account)', $account);
	if (reset($rs[0])) die_error('帳號已存在');
}
function check_password($password){
	if (!ctype_alnum($password)) die_error('密碼只可輸入英文或數字, 大小寫有別.');
}
function check_email($email){
	if ($email=='') return;
	if (!filter_var($email, FILTER_VALIDATE_EMAIL)) die_error('email有誤.');
}

function add_permission($uid, $p) {
	$rs = db()->query('SELECT `permission` FROM `user` WHERE `id`=:id LIMIT 1', $uid);
	$permission = explode(',', $rs->permission);

	if (!is_array($p)) { $p = explode(',', $p); }
	$permission = array_unique(array_merge($permission, $p));

	db()->update('user', 'id=:id',[
		'id'=>$uid,
		'permission'=>implode(',', $permission)
	]);
}

function remove_permission($uid, $p) {
	$rs = db()->query('SELECT `permission` FROM `user` WHERE `id`=:id LIMIT 1', $uid);
	$permission = explode(',', $rs->permission);

	if (!is_array($p)) { $p = explode(',', $p); }
	$permission = array_diff($permission, $p);

	db()->update('user', 'id=:id',[
		'id'=>$uid,
		'permission'=>implode(',', $permission)
	]);
}






?>