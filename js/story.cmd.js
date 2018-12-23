var story = (function(_M){

_M.Cmd = function(opt, parent) {
    opt = opt || {}

    this.parent = opt.parent || parent
    this.id = _M.util.addObj(this)

    this.kind = opt.kind
    this.txt = opt.txt || ''

    // -----------------------------------------------------------------------------
    this.remove = function(){
        _M.util.removeFromParent(this, 'cmdList')
        _M.util.removeObj(this)
    }

    this.getDomID = function(){ return 'cmd'+this.id }

    // -----------------------------------------------------------------------------
    this.getNote = function(){ 
    	if (!this.parent) return null

    	if (this.parent instanceof _M.Note) { 
    		return this.parent
    	} else if (this.parent instanceof _M.Option) {
    		return this.parent.parent
    	} else if (this.parent instanceof _M.Noteset) {
    		return null
    	} else {
    		return null
    	}
    }
    this.getNoteset = function(){ 
    	if (!this.parent) return null

    	if (this.parent instanceof _M.Note) { 
    		return this.parent.parent
    	} else if (this.parent instanceof _M.Option) {
    		if (!this.parent.parent) return null
    		return this.parent.parent.parent
    	} else if (this.parent instanceof _M.Noteset) {
    		return this.parent
    	} else {
    		return null
    	}
    }

    // -----------------------------------------------------------------------------
    this.export = function(){
        let ret = {
            kind: this.kind,
            txt: this.txt
        }
        return ret
    }
    this.import = function(data){
        this.kind = data.kind
        this.txt = data.txt
        return this
    }
    this.exportMarkdown = function(){
        let lead = ''
        let br = ''
        if (this.parent){
            if(this.parent instanceof _M.Note) {
                br='\n'
                lead = '        '
            }
            else if(this.parent instanceof _M.Noteset) {
                br='\n'
                lead = '    '
            }
        }

        if (this.kind=='txt') return lead + this.txt + br
        else if (this.kind=='qstr') return lead + '`?'+this.txt+'`' + br

        // single-line or multi-line code
        let match = /\r|\n/.exec(this.txt)
        if (match) return lead + '```'+this.txt+'```' + br
        return lead + '`'+this.txt+'`' + br
    }
}

return _M
}(story || {}))