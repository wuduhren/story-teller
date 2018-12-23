<nav class="navbar navbar-expand-sm navbar-light bg-light">
    <a class="navbar-brand" href="#">故事系統</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul id="nav_list" class="navbar-nav mr-auto">
            <li class="nav-item">
                <a class="nav-link" href="story_list.php">故事列表</a>
            </li>
            <? if (check_permission('admin')) { ?>
                <li class="nav-item">
                    <a class="nav-link" href="user_list.php">人員管理</a>
                </li>
            <? } ?>
        </ul>
        <div class="navbar-nav ml-auto">
            <a class="nav-item nav-link" href="#" data-toggle="modal" data-target="#set_info_modal">修改個人資料</a>
            <a class="nav-item nav-link" href="index.php">登出</a>
        </div>
    </div>
</nav>

<div id="set_info_modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="set_info_modal" aria-hidden="false" data-backdrop="static" style="display: none;">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">修改個人資料</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
            </div>

            <div class="modal-body">
                <div>
                    <input id="info_acc_inpput" class="form-control" type="text" placeholder="修改帳號, 若不變保持空白">
                    <input id="info_email_input" class="form-control" type="email" placeholder="修改電郵, 若不變保持空白">
                    <input id="info_new_pwd_input" class="form-control" type="text" placeholder="修改密碼, 若不變保持空白">
                    <input id="info_confirm_pwd_input" class="form-control" type="text" placeholder="再輸入一次新密碼">
                    <br>
                    <input id="info_pwd_input" class="form-control" type="text" placeholder="輸入現有密碼">
                    <span class="tiny_info" style="float: right;">* 帳密只可輸入英文及數字, 大小寫有別.</span>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" data-dismiss="modal">取消</button>
                <button id="set_info" class="btn btn-primary">確定</button>
            </div>
        </div>
    </div>
</div>