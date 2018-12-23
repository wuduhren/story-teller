<?php
require(__DIR__.'/../_lib/init.php');
check_login();
$action = get_ajax_action();

if ($action == 'insert')
	insert();
else if ($action == 'save')
	save();
else if ($action == 'remove')
	remove();
die();
//------------------------------------------------------------------------------
function insert(){
	$name = get_request('name');

	$id = db()->insert('story', []);

	$data['id'] = $id;
	$data['name'] = $name;
	$data['noteset'] = [];

	db()->update('story', 'id=:id',[
		'id'=>$id,
		'uid'=>$_SESSION['uid'],
		'data'=>json_encode($data, JSON_UNESCAPED_UNICODE),
		'status'=>1
	]);
	
	die_success($id);
}

function save(){
	$id = get_request('sid');
	$data = get_request('data');

	db()->update('story', 'id=:id',[
		'id'=>$id,
		'data'=>json_encode($data, JSON_UNESCAPED_UNICODE)
	]);
	
	die_success();
}

function remove(){
	$id = get_request('sid');

	db()->update('story', 'id=:id',[
		'id'=>$id,
		'status'=>2
	]);
	
	die_success();
}




?>