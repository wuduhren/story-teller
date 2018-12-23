<?php
require('_lib/init.php');
check_login();

$rs = db()->query('SELECT `id`, `data` FROM `story` WHERE `status`=1 AND `uid`=:uid ORDER BY `id` DESC', $_SESSION['uid']);
$story_data = array();
foreach ($rs->data as $k=>$v) {
    $id = $v->id;
    $data = $v->data;
    $story_data[$id] = $data;
}
$story_data = json_encode($story_data, JSON_UNESCAPED_UNICODE);
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
#story_list {
    margin: 5rem auto;
    width: 90%;
    text-align: center;
}
#add_story, .edit_story {
    width: 10rem;
    height: 10rem;
    margin: 0.5rem;
    font-size: 2.5rem;
    line-height: 1;
    word-wrap: break-word;
    white-space: normal;
}

</style>
</head>
<body>
<? require('nav.php'); ?>

<div id="story_list">
    <button id="add_story" type="button" class="btn btn-outline-secondary">
        <i class="fas fa-plus"></i>
    </button>
</div>

<script src="js/jquery-3.3.1.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/util.js"></script>
<script src="js/util.custom.js"></script>
<script src="js/bootbox.min.js"></script>
<script src="js/nav.js"></script>
<script>
let storyData = <?= $story_data; ?>;

$().ready(function(){
    render()

    // -----------------------------------------------------------------------------
    $("#add_story").click(function() {
        let name = prompt("請輸入故事名稱")
        if (name===null) return //cancel
        if (!nameValid(name)) return

        call_web_api({
            debug: true,
            url: 'action/action_story.php',
            data:{
                action: 'insert',
                name: name
            },
            success: function(sid){
                window.location = 'story.php?sid='+sid+'&add_default=1'
            },
            error: function(msg) {
                alert(msg)
            }
        })
    })

    $('body').on('click', '.edit_story', function(){
        let sid = $(this).attr('data-sid')
        window.location = 'story.php?sid='+sid
    })
})

function render() {
    for (const sid in storyData) {
        let name = JSON.parse(storyData[sid]).name
        if (name.length>9) { name = name.substring(0,8)+'...' }

        let b = $('<button class="edit_story btn btn-outline-secondary">'+name+'</button>')
        b.attr('data-sid', sid)
        $('#story_list').append(b)
    }
}
</script>
</body>
</html>