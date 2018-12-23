var story = (function(_M){

_M.modal = {}

let activeNote = null

let aceConfig = {
    // showGutter: false,
    useWorker: false, //syntax check
    showPrintMargin: false,
    highlightActiveLine: false,
    autoScrollEditorIntoView: true,
    maxLines: 8,
    minLines: 3,
    mode: 'ace/mode/javascript'
}

//--------------------------------------------------------------------------
//add note
$("#show_note_modal").click(function() {
    activeNote = null
    _M.modal.open()
});

_M.modal.open = function(note){
    if (note) {
        activeNote = note
        _M.sidebar.setActive(activeNote.id, 'note')
    }

    empty()

    if (activeNote) {
        let note = activeNote

        $('#name_input').val(note.name)
        if (note.chk) {
            $('#chk_block').show()
            $('#chk_input').val(note.chk)
        }
        if (note.link) {
            $('#link_block').show()
            $('#link_input').val(note.link.getFullname())
        }
        for (const cmd of note.cmdList) {
            let block = $('#cmd_block')
            if (cmd.kind=='msg') addMsg(block, cmd)
            else if (cmd.kind=='func') addFunc(block, cmd)
            else if (cmd.kind=='code') addCode(block, cmd)
        }
        for (const option of note.optionList) { addOption(option) }
        
        $('#remove_note').show()
    } else {
        addMsg($('#cmd_block'))
        $('#remove_note').hide()
    }

    $('#note_modal').modal('show')

    //update autosize textarea
    if (activeNote) {
        setTimeout(function(){ 
            autosize.update($('#note_modal .custom_textarea'))
        }, 150);
    }
}

//save
$("#note_save").click(function() {
    let name = $('#name_input').val()
    let chk = $('#chk_input').val()
    let link = $('#link_input').val()

    //check name
    //若是新增狀態 或 編輯狀態且不是原名稱 檢查名稱
    if (!activeNote || (activeNote && activeNote.name!=name)){
        name = _M.util.checkName(name, _M.activeNoteset, 'noteList')
    }
    if (!name) return

    let note = _M.activeNoteset.addNote({
        name: name,
        chk: chk
    })

    if (!note.setLink(link)) {
        note.remove()
        return
    }
    if (!saveOptionTo(note)) {
        note.remove()
        return
    }
    if (!saveCmdTo(note, $('#cmd_block'))){
        note.remove()
        return
    }

    //edit
    if (activeNote) {
        activeNote.replaceBy(note)
        _M.render(_M.activeNoteset, true, activeNote)
        close()
    //add
    } else {
        _M.render(_M.activeNoteset, true, note)
        close()
    }
})

$("#note_cancel").click(function() {
    close()
})

function close(){
    $('#note_modal').modal('hide')
    activeNote = null
    _M.sidebar.setActive()
}

function empty(){
    $('#name_input').val('')

    $('#chk_input').val('')
    $('#chk_block').hide()

    $('#link_input').val('')
    $('#link_block').hide()
    bindLinkList($('#link_input'))

    $('#cmd_block').empty()
    $('#option_block').empty()
}

//remove note
$("#remove_note").click(function() {
    if (!confirm('確定要刪除？')) return
    if (activeNote) {
        if (activeNote.remove()){
            _M.render()
            close()
        }
    }
})

//block remove
$('#note_modal').on('click', '.remove_icon', function(){
    if (!confirm('確定要刪除？')) return
    let block = $(this).parent().parent()

    if (block.attr('id')=='chk_block') {
        $('#chk_input').val('')
        block.hide()

    } else if (block.attr('id')=='link_block') {
        $('#link_input').val('')
        block.hide()

    } else if (block.hasClass('option_chk_block')) {
        block.hide()

    } else {
        block.remove()
    }
})

//link list
function bindLinkList(object){
    let source = []
    for (let noteset of _M.notesetList) {
        for (let note of noteset.noteList) {
            let label = note.getFullname()
            source.push(label)
        }
    }

    object.autocomplete({
        minLength: 0,
        source: source
    }).focus(function(){
        if (this.value == ''){
            $(this).autocomplete('search');
        }
    });
}

//--------------------------------------------------------------------------
//modal button
$("#add_chk").click(function() {
    $('#chk_block').show()
})
$("#add_link").click(function() {
    $('#link_block').show()
})
$("#add_option").click(function() {
    addOption()
})
$("#add_msg").click(function() {
    addMsg($('#cmd_block'))
})
$("#add_func").click(function() {
    addFunc($('#cmd_block'))
})
$("#add_code").click(function() {
    addCode($('#cmd_block'))
})

//--------------------------------------------------------------------------
//option
function addOption(option) {
    let tmp = getTMP('option_tmp', {})
    $('#option_block').append(tmp)

    tmp.find('.option_control_block').sortable(sortableConfig)
    autosize(tmp.find('.custom_textarea'))

    let linkInput = tmp.find('.option_link')
    bindLinkList(linkInput)

    if (activeNote && option) {
        let chkInput = tmp.find('.option_chk')
        let txtInput = tmp.find('.option_txt')
        let cmdBlock = tmp.find('.option_cmd_block')

        optionSetChk(chkInput, option.chk)
        txtInput.val(option.txt)
        if (option.link) linkInput.val(option.link.getFullname())

        for (const cmd in option.cmdList) {
            if (cmd.kind=='func') addFunc(cmdBlock, cmd)
            else if (cmd.kind=='code') addCode(cmdBlock, cmd)
        }
    }
}

function saveOptionTo(note) {
    let toReturn = true
    $('#option_block .option_warpper').each(function(index) {
        let $this = $(this)
        let txt = $this.find('.option_txt').val()
        let chk = $this.find('.option_chk').val()
        let link = $this.find('.option_link').val()
        let cmdBlock = $this.find('.option_cmd_block')

        let option = note.addOption({
            txt: txt,
            chk: chk
        })

        if (!option.setLink(link)) {
            toReturn = false
            return false
        }
        if (!saveCmdTo(option, cmdBlock)) {
            toReturn = false
            return false
        }
    })
    return toReturn
}


function optionSetChk(textarea, input){
    if (!input || input=='') {
        textarea.parent().hide()
    } else {
        textarea.parent().show()
        textarea.val(input)
    }
}

$('#note_modal').on('click', '.option_add_chk', function(){
    $(this).parent().parent().find('.option_chk_block').show()
})

//add option cmd
$('#note_modal').on('click', '.option_add_func', function(){
    let block = $(this).parent().parent().find('.option_cmd_block')
    addFunc(block)
})
$('#note_modal').on('click', '.option_add_code', function(){
    let block = $(this).parent().parent().find('.option_cmd_block')
    addCode(block)
})

//option remove
$('#note_modal').on('click', '.option_remove', function(){
    if (confirm('確定要刪除？')) {
        $(this).parent().parent().remove()
    }
})

//change order
$('body').on('click', '.option_upward', function(){
    let o = $(this).parent().parent()
    o.insertBefore(o.prev())
})
$('body').on('click', '.option_downward', function(){
    let o = $(this).parent().parent()
    o.insertAfter(o.next())
})


//--------------------------------------------------------------------------
//cmd
let cmdCounter = 0

function saveCmdTo(parent, block) {
    let toReturn = true
    block.find('.block').each(function(index) {
        let $this = $(this)
        let kind = $this.attr('data-kind')
        let id = $this.attr('data-id')
        let txt = ''

        if (kind=='msg') { txt = $.trim($('#'+id).val()) } //remove leading and trailing whitespace
        else if (kind=='func') { txt = ace.edit(id).getValue() }
        else if (kind=='code') { txt = ace.edit(id).getValue() }

        if (txt=='') return //continue in jquery each

        let cmd = parent.addCmd({
            kind: kind,
            txt: txt
        })
    })
    return toReturn
}

function addMsg(block, cmd) {
    let id = getCmdID()
    let tmp = getTMP('msg_tmp', {
        id: id
    })
    block.append(tmp)
    autosize(tmp.find('.custom_textarea'))

    if (activeNote && cmd) { $('#'+id).val(cmd.txt) }
}
function addFunc(block, cmd) {
    let id = getCmdID()
    let tmp = getTMP('func_tmp', {
        id: id
    })
    block.append(tmp)
    ace.edit(id, aceConfig)

    if (activeNote && cmd) { ace.edit(id).setValue(cmd.txt, 1); }
}
function addCode(block, cmd) {
    let id = getCmdID()
    let tmp = getTMP('code_tmp', {
        id: id
    })
    block.append(tmp)
    ace.edit(id, aceConfig)

    if (activeNote && cmd) { ace.edit(id).setValue(cmd.txt, 1); }
}
function getCmdID() {
    return 'modal_cmd'+(cmdCounter++)
}

//--------------------------------------------------------------------------
// hover effect
$('#note_modal').on('mouseenter', '.block', function(){
    $(this).addClass('block_hover')
    $(this).children('textarea, pre').addClass('block_hover')

    let removeButton = $(this).find('.remove_icon')
    let sortButton = $(this).find('.sortable_icon')

    if (removeButton.length) {
        removeButton.show()
        $(this).find('.icon').hide()
    }
    if (sortButton.length) {
        sortButton.show()
    }
})
$('#note_modal').on('mouseleave', '.block', function(){
    $(this).removeClass('block_hover')
    $(this).children('textarea, pre').removeClass('block_hover')

    let removeButton = $(this).find('.remove_icon')
    let sortButton = $(this).find('.sortable_icon')

    if (removeButton.length) {
        removeButton.hide()
        $(this).find('.icon').show()
    }
    if (sortButton.length) {
        sortButton.hide()
    }
})

return _M
}(story || {}));