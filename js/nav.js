$().ready(function(){
    let file = location.pathname.substring(location.pathname.lastIndexOf('/')+1)
    $('a[href="'+file+'"]').addClass('active')

    //------------------------------------------------------------------------------
    $('#set_info').click(function(){
    	let account = $('#info_acc_inpput').val()
    	let email = $('#info_email_input').val()
    	let newPwd = $('#info_new_pwd_input').val()
    	let confirmPwd = $('#info_confirm_pwd_input').val()
    	let pwd = $('#info_pwd_input').val()

        if (pwd==''){
            alert('現有密碼為必要欄位')
            return
        }

    	let data = {}
    	data.action = 'set_info'
        data.password = pwd
        
    	if ($.trim(account)!='') data.account = account
    	if ($.trim(email)!='') data.email = email
    	if ($.trim(newPwd)!='') {
    		if (newPwd!=confirmPwd) {
    			alert('新密碼不一致')
    			return
    		}
    		data.new_password = newPwd
    		data.confirm_password = confirmPwd
    	}

    	call_web_api({
    	    debug: true,
    	    url: 'action/action_user.php',
    	    data: data,
            success: function(sid){
                bootbox.alert('修改成功', function(){
                    window.location = 'index.php'
                })
            },
    	    error: function(msg) {
    	        alert(msg)
    	    }
    	})
    })
})