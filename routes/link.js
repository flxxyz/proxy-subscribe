var router = require('express').Router()
var AV = require('leanengine')
var util = require('../utils/util')

router.get('/', function (req, res, next) {
    return res.redirect('/')
})
router.get('/:linkId', async function (req, res, next) {
    res.set('Content-Type', 'text/plain')

    let linkId = req.params.linkId
    if (!/^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/.test(linkId)) {
        return res.send('')
    }

    let [getLinkError, link] = await util.execute(AV.Cloud.run('getLink', {
        linkId: req.params.linkId
    }))

    if (getLinkError) {
        return res.send('')
    }

    if (!link) {
        return res.send('')
    }

    if (!link.get('isEnable')) {
        return res.send('')
    }

    // let link = AV.Object.createWithoutData('Link', row.get('objectId'))
    // link.increment('counter', 1)
    // link.save()

    return res.send(link.get('content'))
})


module.exports = router