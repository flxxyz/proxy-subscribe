var router = require('express').Router()
var AV = require('leanengine')

var Link = AV.Object.extend('Link')

router.get('/', function (req, res, next) {
    return res.redirect('/')
})
router.get('/:linkId', async function (req, res, next) {
    res.set('Content-Type', 'text/plain')
    if (typeof global.map[req.params.linkId] !== 'undefined') {
        let link = global.map[req.params.linkId]
        if ((link.time + 3600) <= new Date().getTime()) {
            delete global.map[req.params.linkId]
        }
        return res.send(link.content)
    }

    let query = new AV.Query(Link)
    query.equalTo('linkId', req.params.linkId)
    let row = await query.first()
    if (!row) {
        return res.redirect('/')
    }

    if (row.get('isDisable')) {
        return res.send('')
    }

    global.map[req.params.linkId] = {
        time: new String(Math.round(new Date().getTime() / 1000)),
        content: row.get('content'),
    }
    // let link = AV.Object.createWithoutData('Link', row.get('objectId'))
    // link.increment('counter', 1)
    // link.save()

    return res.send(global.map[req.params.linkId].content)
})


module.exports = router