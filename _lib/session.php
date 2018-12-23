<?php
function sess_open($save_path, $session_name){
    return true;
}

function sess_close(){
    return true;
}

function sess_read($id){
    $rs = db()->query("SELECT value FROM php_session WHERE id=:id and expiry>:expiry", [
        'id'=>$id,
        'expiry'=>time(),
    ]);
    if ($rs->count()>0) return $rs->value;
    return '';
}

function sess_write($id, $value){
    db()->exec("INSERT INTO `php_session`(id,expiry,value) VALUES(:id,:expiry,:value) ON DUPLICATE KEY UPDATE value=:value, expiry=:expiry", [
        'id'=>$id,
        'value'=>$value,
        'expiry'=>time() + 2592000,
    ]);
    return true;
}

function sess_destroy($id){
    db()->exec("DELETE FROM php_session WHERE id=:id", $id);
    return true;
}

function sess_gc($maxlifetime){
    db()->exec("DELETE FROM php_session WHERE expiry<:expiry", time());
    return true;
}

session_set_save_handler('sess_open', 'sess_close', 'sess_read', 'sess_write', 'sess_destroy', 'sess_gc');
session_start();
?>