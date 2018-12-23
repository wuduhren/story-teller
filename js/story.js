var story = (function(_M){

_M.id = null
_M.name = ''
_M.objList = []
_M.notesetList = []

_M.activeNoteset = null
_M.activeNote = null

//------------------------------------------------------------------------------
_M.clear = function(id){
    _M.id = null
    _M.name = ''
    _M.util.removeList(_M.notesetList)
    _M.notesetList = []
    _M.objList = []
}

_M.findObj = _M.util.findObj
_M.setName = _M.util.setName
_M.render = _M.util.render

//------------------------------------------------------------------------------
_M.removeNoteset = _M.util.remove
_M.addNoteset = function(opt){
    let noteset = new _M.Noteset(opt, this)
    _M.notesetList.push(noteset)
    return noteset
}

//------------------------------------------------------------------------------
_M.export = function() {
    let ret = {
        id: _M.id,
        name: _M.name,
        noteset: [],
        pos: {}
    }
    for (const noteset of _M.notesetList) {
        ret.noteset.push(noteset.export())
    }
    ret.pos = _M.jsp.export()
    return ret
}
_M.import = function(data) {
    if (!data) return

    _M.id = data.id
    _M.name = data.name

    if (data.noteset && data.noteset.length>0) {
        for (const d of data.noteset) { _M.addNoteset().import(d) }
        _M.util.linkInit() //turn link from fullname to _M.Note, call after noteset is imported
        _M.jsp.import(data.pos) //set up pos, jsp import after noteset is imported
    }   
}

//------------------------------------------------------------------------------
_M.save = function(callback){
    if (_M.activeNoteset) { _M.jsp.savePos() }
    call_web_api({
        debug: true,
        url: 'action/action_story.php',
        data:{
            action: 'save',
            sid: _M.id,
            data: _M.export()
        },
        success: function(){
            if (callback) callback()
        },
        error: function(msg) {
            alert(msg)
        }
    })
}
_M.load = function(data, addDefault){
    _M.clear()
    _M.import(data)
    _M.setName(_M.name)
    if (addDefault==1) { _M.util.addDefault() }
    if (_M.notesetList.length>0) { story.render(_M.notesetList[0]) }
}
_M.ready = function(callback){
    $().ready(function(){
        jsPlumb.ready(function(){
            $('#canvas').css('height', ($(window).height()-$('#btn_list').height())*1+'px');
            $('#cmd_block').sortable(sortableConfig)
            autosize($('#note_modal .custom_textarea'))

            callback()
        })
    })
}
_M.remove = function(){
    call_web_api({
        debug: true,
        url: 'action/action_story.php',
        data:{
            action: 'remove',
            sid: _M.id
        },
        success: function(){
            window.location = 'story_list.php'
        },
        error: function(msg) {
            alert(msg)
        }
    })
}























return _M
}(story || {}))