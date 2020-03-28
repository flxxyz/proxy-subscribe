var router = require('express').Router()
var AV = require('leanengine')
var util = require('../utils/util')

router.get('/', async function (req, res, next) {
    let [getAccountAllError, accounts] = await util.execute(AV.Cloud.run('getAccountAll'))

    if (getAccountAllError) {
        accounts = []
    }

    accounts = accounts.map((v) => {
        let serviceType = v.get('serviceType')
        return {
            objectId: v.get('objectId'),
            source: JSON.stringify(v.toFullJSON()),
            remarks: v.get('remarks'),
            serviceType: serviceType,
            host: v.get('host'),
            port: v.get('port'),
            encrypt: v.get(`${serviceType}Setting`).encrypt,
            protocol: v.get(`${serviceType}Setting`).protocol,
        }
    })

    let [getLinkAllError, links] = await util.execute(AV.Cloud.run('getLinkAll'))

    if (getLinkAllError) {
        links = []
    }

    links = links.map((v) => {
        return {
            objectId: v.get('objectId'),
            source: JSON.stringify(v.toFullJSON()),
            linkId: v.get('linkId'),
            sourceID: v.get('sourceID'),
            sourceURL: v.get('sourceURL'),
            isDisable: v.get('isDisable'),
        }
    })

    res.render('account', {
        accounts: accounts,
        links: links,
    })
})
router.post('/add', function (req, res, next) {
    res.send('add')
})


module.exports = router