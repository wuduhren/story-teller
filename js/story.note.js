var story = (function(_M){

_M.Note = function(opt, parent) {
    opt = opt || {}

    this.parent = opt.parent || parent
    this.id = _M.util.addObj(this)

    this.name = opt.name || ''
    this.chk = opt.chk
    this.link = opt.link
    this.cmdList = []
    this.optionList = []

    //------------------------------------------------------------------------------
    this.remove = function(){
        if (!_M.util.removeRelatedLink(this, 'note')) { return false }
        _M.util.removeList(this.cmdList)
        _M.util.removeList(this.optionList)
        _M.util.removeFromParent(this, 'noteList')
        _M.util.removeObj(this)
        return true
    }
    this.removeChild = function(){
        let i = this.optionList.length
        while (i--) {
            let option = this.optionList[i]
            option.remove()
        }

        let j = this.cmdList.length
        while (j--) {
            let cmd = this.cmdList[j]
            cmd.remove()
        }
        
        this.optionList = []
        this.cmdList = []
    }

    this.removeCmd = _M.util.remove
    this.addCmd = _M.util.addCmd

    this.removeOption = _M.util.remove
    this.addOption = function(opt){
        let option = new _M.Option(opt, this)
        this.optionList.push(option)
        return option
    }

    this.setLink = _M.util.setLink
    this.setName = function(name){
        if (this.name==name) { return true }
        if (!_M.util.checkName(name, this.parent, 'noteList')) { return false }
        this.name = name
        return true
    }

    this.replaceBy = function(note){
        if (!(note instanceof _M.Note)) { return null }
        this.name = note.name
        this.chk = note.chk
        this.link = note.link
        this.cmdList = note.cmdList
        this.optionList = note.optionList

        for (let cmd of this.cmdList) {
            cmd.parent = this
        }
        for (let option of this.optionList) {
            option.parent = this
        }

        //remove note only
        note.cmdList = []
        note.optionList = []
        _M.util.removeFromParent(note, 'noteList')
        _M.util.removeObj(note)

        return this
    }

    //------------------------------------------------------------------------------
    this.getNote = function(){ return this }
    this.getNoteset = function(){ return this.parent }
    this.getDomID = function(){ return 'note'+this.id }

    this.getFullname = function(){
        if(this.parent) {
            return this.parent.name + '.' + this.name
        } else {
            return '?.'+this.name
        }
    }

    //direction(string): link_from, link_to, all
    //type(string): getNote, getNoteset
    //return(_M.Note or _M.noteset)
    this.findRelated = function(link_dir, type){
        type = type || 'note'
        let ret = []
        let action = 'getNote'
        if (type=='noteset') { action = 'getNoteset' }
            
        if (link_dir=='link_from' || link_dir=='all'){
            for (let o of _M.objList) {
                if (o && o.link && o.link==this) {
                    ret.push(o[action]())
                }
            }
        }

        if (link_dir=='link_to' || link_dir=='all') {
            if (this.link) { ret.push(this.link[action]()) }
            for (let option of this.optionList) {
                if (option.link) {
                    ret.push(option.link[action]())
                }
            }
        }
        return ret.filter(onlyUnique)
    }

    //------------------------------------------------------------------------------
    this.export = function(){
        let ret = {
            name: this.name,
            cmd: [],
            option: []
        }
        if (this.chk) { ret.chk = this.chk }
        if (this.link) { ret.link = this.link.getFullname() }
        for (const cmd of this.cmdList) { ret.cmd.push(cmd.export()) }
        for (const option of this.optionList) { ret.option.push(option.export()) }
        return ret
    }
    this.import = function(data){
        this.name = data.name
        this.chk = data.chk
        this.link = data.link
        if (data.cmd) for (const d of data.cmd) { this.addCmd().import(d) }
        if (data.option) for (const d of data.option) { this.addOption().import(d) }
        return this
    }
    this.exportMarkdown = function(){
        let ret = ''
        let lead = '        '

        if (this.name) ret += '    !!! '+this.kind+' ' + this.name +'\n'
        if (this.link) ret += lead + '-> ' + this.link.name +'\n'
        if (this.chk) ret += lead + '`@' + this.chk + '`' +'\n'

        for (const o of this.cmdList) ret += o.exportMarkdown()
        for (const o of this.optionList) ret += o.exportMarkdown()
        return ret
    }
}

return _M
}(story || {}))