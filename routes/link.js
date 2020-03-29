var router = require('express').Router()
var AV = require('leanengine')
var util = require('../utils/util')

router.get('/', function (req, res, next) {
    return res.redirect('/')
})
router.get('/:linkId', async function (req, res, next) {
    res.set('Content-Type', 'text/plain')
    if (typeof global.cache[req.params.linkId] !== 'undefined') {
        let link = global.cache[req.params.linkId]
        if ((link.time + 3600) <= new Date().getTime()) {
            delete global.cache[req.params.linkId]
        }
        return res.send(link.content)
    }

    let [getLinkError, link] = await util.execute(AV.Cloud.run('getLink', {
        linkId: req.params.linkId
    }))

    if (getLinkError) {
        return res.redirect('/')
    }

    if (link.get('isDisable')) {
        return res.send('')
    }

    global.cache[req.params.linkId] = {
        time: new String(Math.round(new Date().getTime() / 1000)),
        content: link.get('content'),
    }
    // let link = AV.Object.createWithoutData('Link', row.get('objectId'))
    // link.increment('counter', 1)
    // link.save()

    return res.send(global.cache[req.params.linkId].content)
})


module.exports = router