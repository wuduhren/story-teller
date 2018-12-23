var story = (function(_M){

let counter = 0

_M.util = {}

//------------------------------------------------------------------------------
_M.util.findObj = function(id, type){
    type = type || typeof(id)
    if (type=='number' || parseInt(id)) { return _M.objList[id] }
    if (type=='object') { return id }
    if (type=='name' || 'string') {
        let obj = _M.util.findObjByName(id)
        if (obj) { return obj }
    }
    if (type=='domID' || 'string') {
        let obj = _M.util.getObjByDomID(id)
        if (obj) { return obj }
    }
    return null
}
_M.util.addObj = function(obj){
    _M.objList[++counter] = obj
    return counter
}
_M.util.removeObj = function(obj){
    _M.objList[obj.id] = null
}

_M.util.getObjByDomID = function(id){
    if (id.includes('noteset') &&
        _M.objList[id.substring(7)] &&
        _M.objList[id.substring(7)] instanceof _M.Noteset) {
        return _M.objList[id.substring(7)]

    } else if (id.includes('note') &&
        _M.objList[id.substring(4)] &&
        _M.objList[id.substring(4)] instanceof _M.Note) {
        return _M.objList[id.substring(4)]

    } else if (id.includes('option') &&
        _M.objList[id.substring(6)] &&
        _M.objList[id.substring(6)] instanceof _M.Note) {
        return _M.objList[id.substring(6)]

    } else if (id.includes('cmd') &&
        _M.objList[id.substring(3)] &&
        _M.objList[id.substring(3)] instanceof _M.Note) {
        return _M.objList[id.substring(3)]
    }
    return null
}
_M.util.findObjByName = function(name){
    if (!name || name=='') return null
    for (const obj of _M.objList) {
        if (!obj) continue
        if (obj.getFullname && obj.getFullname()==name) return obj
        if (obj.name == name) return obj
    }
    return null
}

//------------------------------------------------------------------------------
_M.util.setName = function(name){
    if (!nameValid(name)) return
    this.name = name
    $('#story_name').text(name)
}

//noteset(_M.Noteset): noteset to setActive and to jsp render
//sidebar(bool): to render sidebar or not
//note(_M.Note): note to set highlight
_M.util.render = function(noteset, sidebar, note) {
    noteset = noteset || _M.activeNoteset
    sidebar = sidebar || true

    if (_M.activeNoteset) { _M.jsp.savePos() } //save pos before render
        
    _M.activeNoteset = noteset
    _M.sidebar.setActive(noteset.id)
    _M.jsp.render()
    if (sidebar) { _M.sidebar.render() }
    if (note) { _M.jsp.setHightlight(note) }
}

_M.util.linkInit = function(){
    for (const noteset of _M.notesetList) {
        for (const note of noteset.noteList) {
            note.setLink(note.link)
            for (const option of note.optionList) {
                option.setLink(option.link)
            }
        }
    }
}

_M.util.addDefault = function(){
    if (_M.notesetList.length>0) return
    let noteset = _M.addNoteset()
    let note1 = noteset.addNote()
    let note2 = noteset.addNote()
    let note3 = noteset.addNote()

    noteset.setName('章節1')
    note1.setName('對話1')
    note2.setName('對話2')
    note3.setName('對話3')

    note1.addCmd({'kind':'msg', 'txt':'這裡是故事的起點'})
    note1.addOption({txt:'選項1'}).setLink('對話2')
    note1.addOption({txt:'選項2'}).setLink('對話3')
}

//------------------------------------------------------------------------------
_M.util.remove = function(id) {
    let obj = _M.findObj(id)
    if (obj) obj.remove()
}

//obj: Note/Noteset, type(string): note/noteset
_M.util.removeRelatedLink = function(obj, type){
    let list = []
    let nameList = []
    let method = ''

    let string = '刪除後, 以下對話的連結將會消失:'

    if (type=='noteset') {
        method = 'getNoteset'
    } else if (type=='note') {
        method = 'getNote'
    } else {
        alert('Error: _M.util.removeRelatedLink()')
        return false
    }

    for (let o of _M.objList) {
        if (!o) { continue }
        if (!o.link) { continue }
        if (type=='noteset' && o.getNoteset()==obj) { continue } //get obj not in this noteset
        if (o.link[method]()==obj) {
            list.push(o)
            nameList.push(o.getNote().getFullname())
        }
    }

    for (let name of nameList.filter(onlyUnique)) { string+=('\n'+name) }
    string+='\n確定要刪除?'

    if (list.length==0 || confirm(string)) {
        //remove link to obj
        for (let obj of list) { obj.setLink(null) }
            
        if (type=='noteset') {
            //remove within
            for (let note of obj.noteList) {
                note.setLink(null)
                for (let option of note.optionList) {
                    option.setLink(null)
                }
            }
        }
        return true
    } else {
        return false
    }
}

_M.util.removeList = function(list){
    let i = list.length;
    while (i--) {list[i].remove()}
    list = null
}

_M.util.removeFromParent = function(obj, parentlistName){
    if (!obj) return
    if (!obj.parent) return

    let t = obj.parent[parentlistName]
    let idx = t.indexOf(obj)
    t.splice(idx, 1)
}

//------------------------------------------------------------------------------
_M.util.addCmd = function(opt){
    let cmd = new _M.Cmd(opt, this)
    this.cmdList.push(cmd)
    return cmd
}

//obj(_M.Note or id or fullname)
_M.util.setLink = function(obj){
    if (obj===null || obj===undefined || obj=='') {
        this.link = null
        return true
    }

    let o = _M.util.findObj(obj) 
    if ((o instanceof _M.Note)) {
        this.link = o
    } else {
        let patch = _M.util.patchNote(_M.activeNoteset, obj)
        if (!patch) return false
        this.link = patch
    }
    return true
}

_M.util.checkName = function(name, parent, parentlistName){    
    if (!parent || !parent[parentlistName]) {
        alert('對話資料有誤')
        return null
    }

    if (!nameValid(name)) return null

    for (const obj of parent[parentlistName]) {
        if (obj.name == name && obj.name!='') {
            alert('章節中名稱不可重複')
            return null
        }
    }
    return name
}


_M.util.patchNote = function(parent, name){
    if (confirm('找不到連結, 是否在「'+parent.name+'」下新增名為「'+name+'」的對話?')){
        if (!_M.util.checkName(name, parent, 'noteList')) { return null }
        let newNote = _M.activeNoteset.addNote({
            name: name
        })
        return newNote
    }
    return null
}

return _M
}(story || {}))