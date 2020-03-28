function row_add(e) {
    var remarks = e.parentNode.parentNode.querySelector('.remarks')
    var type = e.parentNode.parentNode.querySelector('.type')
    var url = e.parentNode.parentNode.querySelector('.url')
    console.log('remarks=', remarks.value, ', type=', type.value, ', url=', url.value)
}

function row_del(e) {
    console.log(e, e.id)
}

