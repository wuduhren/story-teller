var story = (function(_M){

_M.jsp = {}
let jspPos = {}

let endpointRadius = 3
let msgLimit = 30
let optionLimit = 11
let canvas = $('#canvas')

// -----------------------------------------------------------------------------
//connecting lines style
let connectorPaintStyle = {
    strokeWidth: 1.5,
    stroke: "#999",
    joinstyle: "round",
    outlineStroke: "white",
    outlineWidth: 1.5
}

// let connectorHoverStyle = {
//     strokeWidth: 2,
//     stroke: "#999",
//     outlineWidth: 2,
//     outlineStroke: "white"
// }
// let endpointHoverStyle = {
//     fill: "#999",
//     stroke: "#999"
// }

//the definition of source endpoints
let sourceEndpoint = {
    endpoint: "Dot",
    paintStyle: {
        stroke: "#7AB02C",
        fill: "transparent",
        radius: endpointRadius,
        strokeWidth: 1
    },
    isSource: true,
    connector: [ "StateMachine", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
    connectorStyle: connectorPaintStyle,
    // hoverPaintStyle: endpointHoverStyle,
    // connectorHoverStyle: connectorHoverStyle,
    dragOptions: {},
    overlays: [
        [ "Label", {
            location: [0.5, 1.5],
            label: "Drag",
            cssClass: "endpointSourceLabel",
            visible:false
        } ]
    ],
    anchor: "BottomCenter"
}

//the definition of target endpoints 
//will appear when the user drags a connection
let targetEndpoint = {
        endpoint: "Dot",
        paintStyle: { fill: "#7AB02C", radius: endpointRadius },
        // hoverPaintStyle: endpointHoverStyle,
        maxConnections: -1,
        dropOptions: { hoverClass: "hover", activeClass: "active" },
        isTarget: true,
        overlays: [
            [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible:false } ]
        ],
        anchor: "TopCenter"
    }

let optionEndpoint = {
    endpoint: "Dot",
    paintStyle: {
        stroke: "#7AB02C",
        fill: "transparent",
        radius: endpointRadius,
        strokeWidth: 1
    },
    isSource: true,
    connector: [ "Bezier", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
    connectorStyle: connectorPaintStyle,
    // hoverPaintStyle: endpointHoverStyle,
    // connectorHoverStyle: connectorHoverStyle,
    dragOptions: {},
    overlays: [
        [ "Label", {
            location: [0.5, 1.5],
            label: "Drag",
            cssClass: "endpointSourceLabel",
            visible:false
        } ]
    ],
    anchor: ["RightMiddle"]
}

let jsp = window.jsp = jsPlumb.getInstance({
    DragOptions: { cursor: 'pointer', zIndex: 2000 },
    ConnectionOverlays: [
        ["Arrow", {
            location: 1,
            visible:true,
            width:11,
            length:11,
            id:"ARROW"
        }]
    ],
    Container: canvas.attr('id')
})

// -----------------------------------------------------------------------------
_M.jsp.import = function(data){
    if (!data) return

    let pos = {}
    for (let notesetName in data) {
        let noteset = _M.findObj(notesetName, 'name')
        if (!noteset) continue

        for (noteFullname in data[notesetName]) {
            let note = _M.findObj(noteFullname, 'name')
            if (!note) continue
            if (!pos[noteset.id]) pos[noteset.id] = {}
            pos[noteset.id][note.getDomID()] = data[notesetName][noteFullname]
        }
    }
    jspPos = pos
}
_M.jsp.export = function(data){
    let ret = {}
    for (const nsid in jspPos) {
        let noteset = _M.findObj(nsid)
        if (!noteset) continue
        for (const domID in jspPos[nsid]) {
            let note = _M.findObj(domID, 'domID')
            if (!note) continue
            if (!ret[noteset.name]) ret[noteset.name] = {}
            ret[noteset.name][note.getFullname()] = jspPos[nsid][domID]
        }
    }
    return ret
}

_M.jsp.savePos = function(){
    let pos = {}
    canvas.find('.normal_window').each(function(index) {
        let id = $(this).attr('id');
        let top = $(this).css('top');
        let left = $(this).css('left');
        pos[id] = {top: top, left: left};
    })
    pos.scroll = canvas.scrollTop();

    jspPos[_M.activeNoteset.id] = pos
}

_M.jsp.clear = function(){
    jsp.reset(true);
    canvas.empty();
}

// -----------------------------------------------------------------------------
_M.jsp.render = function(noteset){
    noteset = noteset || _M.activeNoteset

    _M.jsp.clear()

    let linkTo = noteset.findRelated('link_to')
    let linkFrom = noteset.findRelated('link_from')

    jsp.batch(function(){
        //render note div
        for (const note of noteset.noteList) { addWindow(note) }

        //render external note
        let external = linkFrom.concat(linkTo).filter(onlyUnique)
        for (const note of external) { addWindow(note, 'external') }

        //connect note div
        for (const note of noteset.noteList) { connectWindow(note) }
        for (const note of linkFrom) { connectWindow(note) }

        //set pos
        if (jspPos && jspPos[noteset.id] && jspPos[noteset.id]!={}) {
            pr('setLayout')
            let pos = jspPos[noteset.id]
            setLayout(linkFrom, noteset.noteList, linkTo, pos)

        } else {
            pr('autoLayout')
            autoLayout(linkFrom, noteset.noteList, linkTo)
        }

        jsp.draggable(jsPlumb.getSelector('#'+canvas.attr('id')+' .normal_window'), {grid: [20, 20], drag: onDrag});
    })
}

_M.jsp.setHightlight = function(note){
    let w = $('#'+note.getDomID())
    w.addClass('highlight')
    setTimeout(function(){ 
        w.removeClass('highlight')
    }, 900);
}

function onClick(noteWindow, id){
    let note = _M.findObj(id, 'domID')
    if (noteWindow.hasClass('external_window')) {
        _M.render(note.getNoteset(), false, note)
    } else {
        _M.modal.open(note)
    }
}

// -----------------------------------------------------------------------------
function addWindow(note, type){
    type = type || 'normal'
    let id = note.getDomID()
    let tmp = ''
    if (type=='external') {
        tmp = getTMP('external_tmp', {
            id: id,
            name: note.getFullname()
        })
    } else if (type=='normal'){
        tmp = getTMP('note_tmp', {
            id: id,
            name: note.name
        })
    }

    //show first msg
    for (const cmd of note.cmdList) {
        if (cmd.kind=='msg') {
            let txt = cmd.txt
            if (txt.length>msgLimit) { txt = txt.substring(0,msgLimit-2)+'...' }
            tmp.append('<div class="msg_area">'+txt+'</div>')
            break
        }
    }

    if (note.optionList.length>0) {
        let optionArea = $('<div class="option_area"></div>')
        for (const option of note.optionList) {
            let txt = option.txt
            if (txt.length>optionLimit) { txt = txt.substring(0,optionLimit-2)+'...' }
            optionArea.append('<div id="'+option.getDomID()+'" class="note_option">'+txt+'</div>')
        }
        tmp.append(optionArea)
    }

    tmp.on('mousedown',  onMousedown).on('mouseup', onMouseup)
    canvas.append(tmp)

    //add endpoint 
    jsp.addEndpoint(id, targetEndpoint, {uuid: id+'_target'})
    jsp.addEndpoint(id, sourceEndpoint, {uuid: id+'_source'});
    for (const option of note.optionList) {
        jsp.addEndpoint(option.getDomID(), optionEndpoint, {uuid: option.getDomID()});
    }
}
function connectWindow(note){
    if (note.link) {
        let uuid = note.link.getDomID()+'_target'
        if (jsp.getEndpoint(uuid)) {
            jsp.connect({uuids: [note.getDomID()+'_source', uuid], editable: false, detachable: false})
        }
    }
    for (const option of note.optionList) {
        if (option.link) {
            let uuid = option.link.getDomID()+'_target'
            if (jsp.getEndpoint(uuid)) {
                jsp.connect({uuids: [option.getDomID(), uuid], editable: false, detachable: false})
            }
        }
    }
}

function setLayout(linkFrom, noteList, linkTo, pos){
    for (const note of linkFrom) {
        let id = note.getDomID()
        if (pos[id]) { setPositionPX(id, pos[id].left, pos[id].top) }
    }
    for (const note of noteList) {
        let id = note.getDomID()
        if (pos[id]) { setPositionPX(id, pos[id].left, pos[id].top) }
    }
    for (const note of linkTo) {
        let id = note.getDomID()
        if (pos[id]) { setPositionPX(id, pos[id].left, pos[id].top) }
    }
    if (pos.scroll) { canvas.scrollTop(pos.scroll) }
}

function autoLayout(linkFrom, noteList, linkTo){
    let layouterConfig = {
        rankdir:'LR', align:'DL',
        ranker:'network-simplex',
        // ranker:'tight-tree',
        // ranker:'longest-path',
        nodesep:100, edgesep:80, ranksep:90,
        marginx:0, marginy:0,
    }
    
    let layouter = new dagre.graphlib.Graph({
        directed:true, compound:true, multigraph:true,
    })

    layouter.setGraph(layouterConfig)
    layouter.setDefaultEdgeLabel(function(){return{};})

    //add each note
    canvas.find('.normal_window').each(function(e){
        let $this = $(this)
        let id = $this.attr('id')
        layouter.setNode(id, {id:id, width:$this.width(), height:$this.height()})
    })

    //add each note relation
    for (let note of noteList) {
        for (let related of note.findRelated('all', 'note')) {
            layouter.setEdge(note.getDomID(), related)
        }
    }
    for (let note of linkFrom) {
        for (let related of note.findRelated('link_to', 'note')) {
            layouter.setEdge(note.getDomID(), related)
        }
    }
    for (let note of linkTo) {
        for (let related of note.findRelated('link_from', 'note')) {
            layouter.setEdge(note.getDomID(), related)
        }
    }

    //set position
    dagre.layout(layouter)
    layouter.nodes().forEach(function(domID) {
        let node = layouter.node(domID)
        if (node) { setPositionPX(domID, node.x, node.y) }
    })
}

function setPositionPX(id, left, top){
    $('#'+id).css({"left": left, "top": top});
}

// -----------------------------------------------------------------------------
let maxClickMoveRange = 2

let activeWindow = null
let activeWindowX = null
let activeWindowY = null

function onMousedown(e){
    activeWindow = $(this)
    let offset = activeWindow.offset()
    activeWindowX = offset.left
    activeWindowY = offset.top
}

function onMouseup(e){
    let $this = $(this)
    let offset = $this.offset()
    let x = offset.left
    let y = offset.top
    let id = $this.attr('id')

    //讓 click 以及 drag 可以相容
    if(activeWindow && activeWindow.attr('id')==id) {
        activeWindow = null
        if (Math.abs(x-activeWindowX)>maxClickMoveRange) return
        if (Math.abs(y-activeWindowY)>maxClickMoveRange) return
        onClick($this, id)
    }
}

function onDrag(e) {
    //避免移出上方以及左方邊界
    let el = e.el
    let x = parseInt(el.style.left)
    let y = parseInt(el.style.top)
    if (x<0) {
        x = 0
        el.style.left = '0px'
    }
    if (y<0) {
        y = 0
        el.style.top = '0px'
    }
}

// -----------------------------------------------------------------------------
//hover effect
canvas.on('mouseenter', '.external_window', function(){
    $(this).find('.external_icon').addClass('external_icon_hover')
})
canvas.on('mouseleave', '.external_window', function(){
    $(this).find('.external_icon').removeClass('external_icon_hover')
})

return _M
}(story || {}))