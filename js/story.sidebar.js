var story = (function(_M){

_M.sidebar = {}

_M.sidebar.render = function(){
    $('#sidebar_list').empty()

    for (let noteset of _M.notesetList) {
        let h = '';
        let ns = $('<li class="sidebar_noteset"><a>'+noteset.name+'<i class="edit_noteset fas fa-pen"></i><i class="remove_noteset far fa-trash-alt"></i></a></li>');
        ns.attr('data-nsid', noteset.id)

        for (let note of noteset.noteList) {
            h += '<li class="sidebar_note" data-nid="'+note.id+'"><a>'+note.name+'</a></li>';
        }
        $('#sidebar_list').append(ns)
        ns.after(h)

        _M.sidebar.setActive()
    }
}

_M.sidebar.setActive = function(id, type){
    type = type || 'noteset'
    id = id || _M.activeNoteset.id

    $('#sidebar_list').find('.active').removeClass('active')

    if (type=='noteset') {
        $('#sidebar_list .sidebar_noteset').each(function(index) {
            if ($(this).attr('data-nsid')==id) { $(this).addClass('active') }
        })
    } else if (type=='note') {
        $('#sidebar_list .sidebar_note').each(function(index) {
            if ($(this).attr('data-nid')==id) { $(this).addClass('active') }
        })
    }
}

//------------------------------------------------------------------------------
//show and hide sidebar
$('body').on('click', '#show_sidebar', function(){
    $('#sidebar').toggleClass('sidebar_toggle');
    $('#main').toggleClass('sidebar_toggle');
})

//sidebar event
$('#sidebar_list').on('click', '.sidebar_noteset', function(){
    let id = $(this).attr('data-nsid')
    let noteset = _M.findObj(id)
    if (noteset!=_M.activeNoteset) { _M.render(noteset, false) }
})
$('#sidebar_list').on('click', '.sidebar_note', function(){
    let id = $(this).attr('data-nid')
    let note = _M.findObj(id)
    let noteset = note.getNoteset()

    if (noteset!=_M.activeNoteset) { _M.render(noteset, false, note) }
    else { _M.jsp.setHightlight(note) }

    _M.modal.open(note)
})

//------------------------------------------------------------------------------
//noteset
//add noteset
$('#sidebar').on('click', '#add_noteset', function(){
    let name = prompt("請輸入章節名稱")
    if (name===null) return //cancel
    if (!_M.util.checkName(name, _M, 'notesetList')) return

    let noteset = _M.addNoteset({
        name: name
    })
    let note = noteset.addNote({
        name: '對話1'
    })

    _M.render(noteset, true, note)
})
//edit noteset
$('#sidebar').on('click', '.edit_noteset', function(){
    let id = $(this).parent().parent().attr('data-nsid');
    let noteset = _M.findObj(id)
    let name = prompt("輸入章節名稱", noteset.name)
    if (name===null) return //cancel
    noteset.setName(name)

    _M.render(noteset)
})
//remove noteset
$('#sidebar').on('click', '.remove_noteset', function(){
    let id = $(this).parent().parent().attr('data-nsid');
    let noteset = _M.findObj(id)
    if (!confirm('確定要刪除此章節「'+noteset.name+'」?')) return
    noteset.remove()
    _M.render(_M.notesetList[0])
})

//------------------------------------------------------------------------------
//story
$("#edit_story").click(function() {
    let name = prompt('輸入故事名稱', _M.name)
    if (name===null) return //cancel
        
    _M.setName(name)
})

$("#remove_story").click(function() {
    if (!confirm("確定要刪除此故事?")) return
    _M.remove()
})

//------------------------------------------------------------------------------
//hover effect
$('#sidebar').on('mouseenter', '#sidebar_header', function(){
    $('#edit_story').show()
    $('#remove_story').show()
})
$('#sidebar').on('mouseleave', '#sidebar_header', function(){
    $('#edit_story').hide()
    $('#remove_story').hide() 
})

$('#sidebar').on('mouseenter', '.sidebar_noteset', function(){
    $(this).find('.edit_noteset').show()
    $(this).find('.remove_noteset').show()
})
$('#sidebar').on('mouseleave', '.sidebar_noteset', function(){
    $(this).find('.edit_noteset').hide()
    $(this).find('.remove_noteset').hide()
})

return _M
}(story || {}))