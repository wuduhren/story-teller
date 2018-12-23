<?php
require('_lib/init.php');
$_SESSION = [];
?>
<!DOCTYPE html>
<html>

<head>
<title>登入</title>
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<link rel="stylesheet" href="css/bootstrap.min.css">
<link rel="stylesheet" href="css/login.css"/>
</head>

<body>

<div class="loginmodal-container">
    <h1>故事系統登入</h1><br>
    <div>
        <input placeholder="請輸入帳號" id="acc_input" class="login_input" type="text">
        <input placeholder="請輸入密碼" id="pwd_input" class="login_input" type="password">
        <button id="login_btn" class="login_btn">登入</button>
    </div>
</div>
<script src="js/jquery-3.3.1.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/util.js"></script>
<script src="js/util.custom.js"></script>
<script>
$().ready(function(){
    
    $('#login_btn').on('click', function(){
        call_web_api({
            debug: true,
            url: 'action/action_user.php',
            data:{
                action: 'login',
                account: $('#acc_input').val(),
                password: $('#pwd_input').val()
            },
            success: function(sid){
                window.location = 'story_list.php'
            },
            error: function(msg) {
                alert(msg)
            }
        })
    })
})
</script>
</body>
</html>