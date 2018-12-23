function nameValid(name){
    if (!name || name=='') {
        alert('名稱不可為空白')
        return false
    }

    if (name.includes(' ')) {
        alert('名稱不可包含空格')
        return false
    }

    if (name.includes('.')) {
        alert('名稱不可包含"."')
        return false
    }
    return true
}

function getTMP(tmpID, prm){
    let h = $('#'+tmpID).prop('innerHTML');
    for (let key in prm) {
        let value = prm[key];
        h = replaceAll(h, '{{'+key+'}}', value);
    }
    return $(h);
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}