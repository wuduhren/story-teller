var story = (function(_M){

_M.Noteset = function(opt, parent) {
    opt = opt || {}

    this.parent = opt.parent || parent
    this.id = _M.util.addObj(this)

    this.name = opt.name || ''
    this.cmdList = []
    this.noteList = []

    //------------------------------------------------------------------------------
    this.remove = function(){
        if (!_M.util.removeRelatedLink(this, 'noteset')) { return false }
        _M.util.removeList(this.cmdList)
        _M.util.removeList(this.noteList)
        _M.util.removeFromParent(this, 'notesetList')
        _M.util.removeObj(this)
        return true
    }

    this.removeCmd = _M.util.remove
    this.addCmd = _M.util.addCmd

    this.removeNote = _M.util.remove
    this.addNote = function(opt){
        let note = new _M.Note(opt, this)
        this.noteList.push(note)
        return note
    }

    this.setName = function(name){
        if (this.name==name) { return true }
        if (!_M.util.checkName(name, this.parent, 'notesetList')) { return false }
        this.name = name
        return true
    }

    //------------------------------------------------------------------------------
    this.getNoteset = function(){ return this }
    this.getNote = function(){ return null }
    this.getDomID = function(){ return 'noteset'+this.id }

    //direction(string): link_from, link_to, all
    //type(string): getNote, getNoteset
    //return(_M.Note or _M.noteset)
    this.findRelated = function(link_dir, type){
        type = type || 'note'
        let ret = []

        for (const note of this.noteList) {
            ret = ret.concat(note.findRelated(link_dir, type))
        }

        ret = ret.filter(onlyUnique)

        //remove self
        if (type=='noteset') {
            let i = ret.length;
            while (i--) {
                let noteset = ret[i]
                if (noteset==this) ret.splice(i, 1)
            }
        } else if (type=='note') {
            let i = ret.length;
            while (i--) {
                let note = ret[i]
                if (note.parent==this) ret.splice(i, 1)
            }
        }
        return ret
    }

    //------------------------------------------------------------------------------
    this.export = function(){
        let ret = {
            name: this.name,
            cmd:[],
            note:[],
        }
        for (const cmd of this.cmdList) { ret.cmd.push(cmd.export()) }
        for (const note of this.noteList) { ret.note.push(note.export()) }
        return ret
    }
    this.import = function(data){
        this.name = data.name
        if (data.cmd) for (const d of data.cmd) { this.addCmd().import(d) }
        if (data.note) for (const d of data.note) { this.addNote().import(d) }
        return this
    }
    this.exportMarkdown = function(){
        let ret = ''
        if (this.name) ret += '!!!! noteset ' + this.name +'\n'
        for (const o of this.cmdList) ret += o.exportMarkdown()
        for (const o of this.noteList) ret += o.exportMarkdown()
        return ret
    }
}

return _M
}(story || {}))