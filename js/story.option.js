var story = (function(_M){

_M.Option = function(opt, parent) {
    opt = opt || {}

    this.parent = opt.parent || parent
    this.id = _M.util.addObj(this)

    this.txt = opt.txt || ''
    this.chk = opt.chk || ''
    this.link = opt.link
    this.cmdList = []

    //------------------------------------------------------------------------------
    this.remove = function(){
        _M.util.removeList(this.cmdList)
        _M.util.removeFromParent(this, 'optionList')
        _M.util.removeObj(this)
    }

    this.removeCmd = _M.util.remove
    this.addCmd = _M.util.addCmd

    this.setLink = _M.util.setLink

    this.getDomID = function(){ return 'option'+this.id }

    //------------------------------------------------------------------------------
    this.getNote = function(){ return this.parent }
    this.getNoteset = function(){ 
        if (!this.parent) return null
        return this.parent.parent
    }

    //------------------------------------------------------------------------------
    this.export = function(){
        let ret = {cmd:[]}
        if (this.txt) { ret.txt = this.txt }
        if (this.chk) { ret.chk = this.chk }
        if (this.link) { ret.link = this.link.getFullname() }
        for (const cmd of this.cmdList) { ret.cmd.push(cmd.export()) }
        return ret
    }
    this.import = function(data){
        this.txt = data.txt
        this.chk = data.chk
        this.link = data.link
        if (data.cmd) for (const d of data.cmd) { this.addCmd().import(d) }
        return this
    }
    this.exportMarkdown = function(){
        let ret = '        '
        if (this.txt) ret += '* ' + this.txt + ' '
        if (this.link) ret += '-> ' + this.link.name  + ' '
        if (this.chk) ret += '`@' + this.chk + '`'  + ' '

        for (const o of this.cmdList) ret += o.exportMarkdown()
        return ret + '\n'
    }
}

return _M
}(story || {}))