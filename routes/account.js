var router = require('express').Router()
var AV = require('leanengine')
var util = require('../utils/util')

router.get('/', async function (req, res, next) {
    let [getAccountAllError, accounts] = await util.execute(AV.Cloud.run('getAccountAll'))

    if (getAccountAllError) {
        accounts = []
    }

    accounts.forEach((v, i) => {
        let serviceType = v.get('serviceType')
        accounts[i] = {
            id: v.get('objectId'),
            source: JSON.stringify(v.toFullJSON()),
            remarks: v.get('remarks'),
            serviceType: serviceType,
            host: v.get('host'),
            port: v.get('port'),
            encrypt: v.get(`${serviceType}Setting`).encrypt,
            protocol: v.get(`${serviceType}Setting`).protocol,
        }
    })

    let [getSubscribeAllError, subscribes] = await util.execute(AV.Cloud.run('getSubscribeAll'))

    if (getSubscribeAllError) {
        subscribes = []
    }

    subscribes.forEach((v, i) => {
        subscribes[i] = {
            id: v.get('objectId'),
            source: JSON.stringify(v.toFullJSON()),
            remarks: v.get('remarks'),
            url: v.get('url'),
        }
    })

    let [getLinkAllError, links] = await util.execute(AV.Cloud.run('getLinkAll'))

    if (getLinkAllError) {
        links = []
    }

    links.forEach((v, i) => {
        links[i] = {
            id: v.get('objectId'),
            source: JSON.stringify(v.toFullJSON()),
            linkId: v.get('linkId'),
            sourceID: v.get('sourceID'),
            sourceURL: v.get('sourceURL'),
            isDisable: v.get('isDisable'),
        }
    })

    res.render('account', {
        accounts: accounts,
        subscribes: subscribes,
        links: links,
    })
})

router.get('/logout', function (req, res, next) {
    if (typeof req.currentUser !== 'undefined') {
        req.currentUser.logOut()
        res.clearCurrentUser()
    }
    res.redirect('/')
})

module.exports = router