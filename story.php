<?php
require('_lib/init.php');
check_login();

$sid = get_request('sid');
$add_default = get_request('add_default', null, 0);

$rs = db()->query('SELECT `data` FROM `story` WHERE `id`=:id AND `uid`=:uid AND `status`=1', $sid, $_SESSION['uid']);
$story_data = $rs->data[0]['data'];
?>
<!DOCTYPE html>
<html>
<head>
<title>撰寫故事</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
<link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css">
<link rel="stylesheet" href="css/bootstrap.min.css">
<link rel="stylesheet" href="css/custom.css">
<link rel="stylesheet" href="css/sidebar.css">
<link rel="stylesheet" href="css/modal.css">
<style>
#canvas {
    position:relative;
    touch-action:none;
    background:rgba(250,250,250,0.5);
    height:520px;
    border:1px solid #CCC;
    display: flex;
    flex-grow:1;
    overflow: scroll;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.normal_window {
    position:absolute;
    width:11rem;
    cursor:pointer;
    padding:0.3rem 0rem;
    border: 1px solid #777;
    box-shadow:0 0 15px #ddd;
    border-radius:8px;
    background-color:rgba(255,255,255,0.6);
    transition:background-color 0.1s ease-in;
    font-size:0.85rem;
    color: #111;
    z-index:10;
    word-wrap: break-word;
}
.external_window {
    background-color: rgba(255, 193, 7, 0.6);
}
.external_icon {
    float: right;
    color: #999;
    cursor: pointer;
    margin-top: ;
}
.external_icon_hover {
    color: #444;
}

.jtk-endpoint {
    z-index: 500
}

.external_window .name_area, .external_window .msg_area, .external_window .note_option {
    background-color: transparent;
}

.highlight {
    box-shadow:0 0 15px var(--yellow);
}

.note_option {
    background-color: #E9F5CA;
}

.name_area {
    font-weight: bold;
}
.name_area, .msg_area, .note_option {
    padding: 0.2rem 0.5rem;
}
.msg_area {
    background-color: #A8EAC0;
}
</style>

<title></title>
</head>
<body>

<div id="sidebar">
    <div id="sidebar_header">
        <div id="story_name"></div>
        <i id="edit_story" class="fas fa-pen"></i>
        <i id="remove_story" class="far fa-trash-alt"></i>
        <br>
    </div>
    <li id="add_noteset"><a><i class="fas fa-plus-circle" style="margin-right: 0.25rem;"></i>新增章節</a></li>
    <ul id="sidebar_list" style="border-top: 0.5px solid #CCC;"></ul>
</div>

<div id="main">
    <div id="btn_list">
        <button id="show_sidebar">&#x2630;</button>
        <button id="show_note_modal"><i class="icon fas fa-plus-square"></i>新增</button>
        <button id="save"><i class="icon fas fa-download"></i>存檔</button>
        <button id="exit"><i class="icon fas fa-walking"></i>離開</button>
    </div>
    <div id="canvas"></div>
</div>

<? require('tmp/jsp_window.html'); ?>
<? require('tmp/modal.html'); ?>

</body>
<script src="js/jquery-3.3.1.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/jsplumb.js"></script>
<script src="js/util.js"></script>
<script src="js/util.custom.js"></script>
<script src="node_modules/autosize/dist/autosize.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU="crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.1/ace.js"></script>
<script src="js/dagre.min.js"></script>

<!-- module -->
<script src="js/story.util.js"></script>
<script src="js/story.js"></script>
<script src="js/story.noteset.js"></script>
<script src="js/story.note.js"></script>
<script src="js/story.option.js"></script>
<script src="js/story.cmd.js"></script>
<script src="js/story.jsp.js"></script>
<script src="js/story.sidebar.js"></script>
<script src="js/story.modal.js"></script>
<script>
let storyData = <?= $story_data ?>;
let addDefault = <?= $add_default ?>;

let sortableConfig = {
    containment: 'parent',
    forcePlaceholderSize: true,
    placeholder: 'sortable-placeholder',
    tolerance: 'pointer',
    cursor: 'grabbing',
    helper: function() {
        return $('<div style="width:100%; height:1rem; background-color: #999;"></div>')
    },
    activate: function(event, ui){
        ui.item.parent().addClass('sorting')
    },
    deactivate: function(event, ui){
        ui.item.parent().removeClass('sorting')
    }
}

story.ready(function(){
    // -----------------------------------------------------------------------------
    story.load(storyData, addDefault)

    // -----------------------------------------------------------------------------
    //event
    $("#save").click(function(){
        story.save()
    })

    $("#exit").click(function() {
        if (confirm('按「確定」儲存後離開, 按「取消」直接離開.')) {
            story.save(function(){
                window.location = 'story_list.php'
            })
        } else {
            window.location = 'story_list.php'
        }
    })

})    
</script>
</html>