<?php
require('_lib/init.php');
check_login('admin');

$rs = db()->query('SELECT `id`, `account`, `status`, `permission`, `time_create` FROM `user` ORDER BY `status` DESC');
?>
<!doctype html>
<html>
<head>
<title>故事列表</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
<link rel="stylesheet" href="css/bootstrap.min.css">
<link rel="stylesheet" href="css/custom.css">
<style>
body {
    text-align: center;
}
#user_table {
    margin-bottom: 1rem;
    margin-top: 1.5rem;
    margin: 1rem auto 1.5rem auto;
    width: 60%;
}
#user_table tbody tr:hover {
    background-color: #f8f9fa;
    cursor: pointer;
}

#add_user {
    margin-top: 1.5rem;
}

</style>
</head>
<body>
<? require('nav.php'); ?>

<button id="add_user" class="clock_in_button btn btn-info" data-toggle="modal" data-target="#add_user_modal">新增人員</button>
<table id="user_table" class="table table-bordered" style="text-align: left;">
    <thead>
        <tr>
            <th>名稱</th>
            <th>狀態</th>
        </tr>
    </thead>
    <tbody id="user_tbody"></tbody>
</table>


<div id="user_action_modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="add_user_modal" aria-hidden="false">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-body">
                <button id="set_admin" class="user_action btn btn-outline-primary">設為管理員</button>
                <button id="unset_admin" class="user_action btn btn-outline-secondary">取消管理員</button>
                <button id="reactivate" class="user_action btn btn-outline-success">啟用</button>
                <button id="suspend" class="user_action btn btn-outline-danger">停權</button>
                <button id="change_pwd_btn" class="user_action btn btn-outline-dark">修改密碼</button>
            </div>
        </div>
    </div>
</div>


<div id="add_user_modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="add_user_modal" aria-hidden="false" data-backdrop="static">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">新增人員</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
            </div>

            <div class="modal-body">
                <div>
                    <input id="acc_inpput" class="form-control" type="text" placeholder="請輸入帳號">
                    <input id="email_input" class="form-control" type="email" placeholder="請輸入電郵">
                    <input id="pwd_input" class="form-control" type="text" placeholder="請輸入密碼">
                    <input id="pwd_confirm_input" class="form-control" type="text" placeholder="請再輸入一次密碼">
                    <span class="tiny_info" style="float: right;">* 帳密只可輸入英文及數字, 大小寫有別.</span>
                </div>
                <div class="form-check" style="text-align: left; margin-top: 1rem; margin-left: 0.2rem;">
                    <input id="is_admin" type="checkbox" class="form-check-input">
                    <label class="form-check-label" for="is_admin">設為管理人員</label>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" data-dismiss="modal">取消</button>
                <button id="add_user_btn" class="btn btn-primary">新增</button>
            </div>
        </div>
    </div>
</div>

<div id="change_pwd_modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="change_pwd_modal" aria-hidden="false" data-backdrop="static">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">修改密碼</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
            </div>

            <div class="modal-body">
                <div>
                    <input id="change_pwd_input" class="form-control" type="text" placeholder="請輸入密碼">
                    <input id="change_pwd_confirm_input" class="form-control" type="text" placeholder="請再輸入一次密碼">
                    <span class="tiny_info" style="float: right;">* 帳密只可輸入英文或數字, 大小寫有別.</span><br>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" data-dismiss="modal">取消</button>
                <button id="admin_change_pwd" class="btn btn-primary">修改</button>
            </div>
        </div>
    </div>
</div>


<script src="js/jquery-3.3.1.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/util.js"></script>
<script src="js/util.custom.js"></script>
<script src="js/bootbox.min.js"></script>
<script src="js/nav.js"></script>
<script>
let userData = <?=json_encode($rs->data)?>;
let user = {};

$().ready(function(){
    render(userData)

    // -----------------------------------------------------------------------------
    $('#add_user_btn').click(function(){
        if ($('#pwd_input').val()!=$('#pwd_confirm_input').val()){
            $('#pwd_input').val('')
            $('#pwd_confirm_input').val('')
            alert('請重新輸入密碼')
            return
        }

        let permission = ''
        if ($('#is_admin').is(':checked')) { permission+='admin' }

        call_web_api({
            debug: true,
            url: 'action/action_user.php',
            data:{
                action: 'insert',
                account: $('#acc_inpput').val(),
                password: $('#pwd_input').val(),
                permission: permission,
                email: $('#email_input').val()
            },
            success: function(sid){
                bootbox.alert('新增成功', function(){
                    location.reload();
                })
            },
            error: function(msg) {
                alert(msg)
            }
        })
    })

    $('tbody tr').on('click', function(){
        user.id = $(this).attr('data-uid')
        user.account = $(this).attr('data-account')
        $('#user_action_modal').modal()
    })

    $('#set_admin').click(function(){
        call_web_api({
            debug: true,
            url: 'action/action_user.php',
            data:{
                action: 'set_admin',
                uid: user.id
            },
            success: function(sid){
                bootbox.alert(user.account+' 已設為管理員', function(){
                    location.reload();
                })
            },
            error: function(msg) {
                alert(msg)
            }
        })
    })

    $('#unset_admin').click(function(){
        call_web_api({
            debug: true,
            url: 'action/action_user.php',
            data:{
                action: 'unset_admin',
                uid: user.id
            },
            success: function(sid){
                bootbox.alert(user.account+' 已設為一般人員', function(){
                    location.reload();
                })
            },
            error: function(msg) {
                alert(msg)
            }
        })
    })

    $('#reactivate').click(function(){
        call_web_api({
            debug: true,
            url: 'action/action_user.php',
            data:{
                action: 'reactivate',
                uid: user.id
            },
            success: function(sid){
                bootbox.alert(user.account+' 已重新啟用', function(){
                    location.reload()
                })
            },
            error: function(msg) {
                alert(msg)
            }
        })
    })

    $('#suspend').click(function(){
        call_web_api({
            debug: true,
            url: 'action/action_user.php',
            data:{
                action: 'suspend',
                uid: user.id
            },
            success: function(sid){
                bootbox.alert(user.account+' 已被停權', function(){
                    location.reload()
                })
            },
            error: function(msg) {
                alert(msg)
            }
        })
    })

    $('#change_pwd_btn').click(function(){
        $('#change_pwd_modal').modal()
    })

    $('#admin_change_pwd').click(function(){
        if ($('#change_pwd_input').val()!=$('#change_pwd_confirm_input').val()){
            $('#change_pwd_input').val('')
            $('#change_pwd_confirm_input').val('')
            bootbox.alert('請重新輸入密碼')
            return
        }

        call_web_api({
            debug: true,
            url: 'action/action_user.php',
            data:{
                action: 'admin_change_pwd',
                uid: user.id,
                password: $('#change_pwd_input').val()
            },
            success: function(sid){
                bootbox.alert(user.account+' 密碼更改', function(){
                    location.reload()
                })
            },
            error: function(msg) {
                alert(msg)
            }
        })
    })
})

function render(userData){
    $("#user_tbody").empty()

    for (var k in userData) {
        var record = userData[k]
        var tr = $('<tr>')
        var status

        if (record.status==0) {
            status = '停權'
        } else if (record.status==1) {
            status = '一般';
            if (record.permission.includes('admin')) {
                status = '管理員';
            }
        }

        tr.attr('data-uid', record.id).attr('data-account', record.account)
        .append($('<td>').html(record.account))
        .append($('<td>').html(status))

        $("#user_tbody").append(tr)
    }
}


</script>
</body>
</html>