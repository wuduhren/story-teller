// -----------------------------------------------------------------------------
var url_home = 'index.html'
var url_expire = 'expire.html'
var url_maintenance = 'maintenance.html'

// -----------------------------------------------------------------------------
// loading
var show_loading_counter = 0
function show_loading() {
    show_loading_counter += 1
    if (show_loading_counter==1) $('#loading').show()
}

function hide_loading(delay, force) {
    setTimeout(function(){
        show_loading_counter -= 1
        if (force==true) show_loading_counter = 0
        if (show_loading_counter<=0) {
            show_loading_counter = 0
            $('#loading').hide()
        }
    }, delay || 0)
}

// -----------------------------------------------------------------------------
// 呼叫網路 API 錯誤處理
var last_web_api_error = ''
function on_call_web_api_error(opt, expected, content) {
    last_web_api_error = content
    if (expected) {
        if (opt.error && content[1]) {
            console.log(content)
            opt.error(content[1])
        }
        else {
            console.log('server error:')
            console.log(content)
            alert('伺服器回傳錯誤')
        }
    }
    else {
        console.log('server error:')
        console.log(content)
        if (opt.error) opt.error('伺服器回傳錯誤')
        else alert('伺服器回傳錯誤')
    }
    
    if (opt.complete) opt.complete()
    hide_loading(0, true)
}

// -----------------------------------------------------------------------------
// 呼叫網路 API
function call_web_api(opt) {
    opt = opt || {}
    opt.delay = opt.delay || 100
    show_loading()

    setTimeout(function(){
        $.ajax({
            url: opt.url,
            type:'POST',
            data:opt.data,
            processData:opt.processData,
            contentType:opt.contentType,
            error:function (xhr, status, err) {
                return on_call_web_api_error(opt, false, xhr.responseText)
            },
            success:function(response, status, xhr) {
                let payload = null

                try{
                    payload = JSON.parse(response)
                }catch(e){
                    console.log(e)
                    return on_call_web_api_error(opt, false, response)
                }

                // 錯誤
                if (payload==null || typeof(payload)!='object')
                    return on_call_web_api_error(opt, false, response)

                let code = payload[0]

                // 錯誤
                if (code==0) {
                    let data = payload[1]
                    if (data)
                        on_call_web_api_error(opt, true, payload)
                    else
                        on_call_web_api_error(opt, false, response)
                    return
                }

                if (opt.debug==true) console.log(response)

                // 成功
                if (code==1) {
                    if (opt.success) opt.success(payload[1])
                    if (opt.complete) opt.complete()
                    hide_loading(0, true)
                    return
                }

                // 維護中
                if (code==2) {
                    if (opt.complete) opt.complete()
                    let url = (payload[1]) ? payload[1] : url_maintenance
                    if (opt.debug==true) {
                        if (confirm(url)==true) window.location=url
                    }
                    else {window.location=url}
                    return
                }

                // 轉址
                if (code==3) {
                    if (opt.complete) opt.complete()
                    let url = (payload[1]) ? payload[1] : url_expire
                    if (opt.debug==true) {
                        if (confirm(url)==true) window.location=url
                    }
                    else {window.location=url}
                    return
                }

                // 錯誤
                on_call_web_api_error(opt, false, response)
            }
        });       
    }, opt.delay);
}

// -----------------------------------------------------------------------------
// pr
function pr() {
    (console.log).apply(null, arguments);
}

// -----------------------------------------------------------------------------
// find_obj
function find_obj(list, key, value) {
    if (typeof(list)!='object') return null

    for (let idx in list) {
        let r = list[idx]
        if (r[key]==value) return r
    }
    return null
}

// -----------------------------------------------------------------------------
// show_warning
function show_warning(msg, selector) {
    hide_loading(200)
    setTimeout(function(){
        $(selector || '#warning').html(msg).show()    
    }, 200)
}

// -----------------------------------------------------------------------------
// show_notify
function show_notify(msg, dealy) {
    setTimeout(() => {
        $.notify({message:msg}, {type:'warning', delay:100, timer:500, z_index:9999, placement:{from:'top', align:'left'}})    
    }, dealy || 0);
}

// -----------------------------------------------------------------------------
// render_pager
function render_pager(selector, data, callback) {
    let pager = $(selector)
    if (pager.length<1) return

    if (!data || data.record_total==0)
        return pager.html('<div class="pager_empty">沒有資料</div>')

    data.page_curr = parseInt(data.page_curr)
    let record_begin = (data.page_curr-1)*data.page_size+1;
    let record_end = record_begin + data.page_size-1;
    if (data.record_total<record_end)
        record_end = data.record_total;

    let s = '<div class="pager">';
    if (data.page_curr>1)
        s += '<a href="#" data-page_no="'+(data.page_curr-1)+'">« 上一頁</a>';

    let count = 0;
    for (i=1; i<=data.page_total; ++i) {
        if (i==data.page_curr) {
            s += '<span class="page_curr" data-page_no="'+i+'">' + i + '</span>';
            count = 0;
            continue;
        }

        if (i>data.page_curr-3 && i<data.page_curr+3) {
            s += '<a href="#" data-page_no="'+i+'">' + i + '</a>';
            count = 0;
            continue;
        }

        if (i<6 || i>data.page_total-5) {
            s += '<a href="#" data-page_no="'+i+'">' + i + '</a>';
            count = 0;
            continue;
        }

        if (++count<4)
            s += '.';
    }

    if(data.page_curr<data.page_total)
        s += '<a href="#" data-page_no="'+(data.page_curr+1)+'">下一頁 »</a>';

    if (data.page_total>1)
        s += ' &nbsp;&nbsp;&nbsp;<a class="page_jumper" href="#">跳頁</a>';

    s += '<br><br>總共 <span class="rec_total">' + data.record_total + '</span> 筆資料, 目前顯示第 <span class="rec_start">' + record_begin + '</span>~<span class="rec_end">' + record_end  + '</span> 筆';
    s += '</div>';

    pager.html(s)
    
    pager.unbind().on('click', 'a', function(){
        let e = $(this);
        if(!e.hasClass('page_jumper')) {
            if (callback) callback({page_no:e.attr('data-page_no'), to_top:true})
            return false;
        }

        let val = e.attr('href');
        let page_no = prompt('請輸入頁碼:', '1');
        if(page_no) {
            if (callback) callback({page_no:page_no, to_top:true})
        }
        return false;
    });
}
