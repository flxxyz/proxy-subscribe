var router = require('express').Router()
var AV = require('leanengine')
var util = require('../utils/util')

router.get('/', async function (req, res, next) {
    let params = {
        user: req.currentUser
    }
    let [getAccountAllError, accounts] = await util.execute(AV.Cloud.run('getAccountAll', params))

    if (getAccountAllError) {
        accounts = []
    }

    accounts.forEach((v, i) => {
        let serviceType = v.get('serviceType')
        accounts[i] = {
            id: v.get('objectId'),
            remarks: v.get('remarks'),
            serviceType: serviceType,
            host: v.get('host'),
            port: v.get('port'),
        }

        if (v.get(`${serviceType}Setting`).isShadowrocket) {
            accounts[i].method = 'auto'
            accounts[i].protocol = v.get(`${serviceType}Setting`).net
        } else {
            accounts[i].method = v.get(`${serviceType}Setting`).method
            accounts[i].protocol = v.get(`${serviceType}Setting`).obfs
        }
    })

    let [getSubscribeAllError, subscribes] = await util.execute(AV.Cloud.run('getSubscribeAll', params))

    if (getSubscribeAllError) {
        subscribes = []
    }

    subscribes.forEach((v, i) => {
        subscribes[i] = {
            id: v.get('objectId'),
            remarks: v.get('remarks'),
            url: v.get('url'),
            isEnable: v.get('isEnable'),
        }
    })

    let [getLinkAllError, links] = await util.execute(AV.Cloud.run('getLinkAll', params))

    if (getLinkAllError) {
        links = []
    }

    links.forEach((v, i) => {
        links[i] = {
            id: v.get('objectId'),
            linkId: v.get('linkId'),
            sourceID: v.get('sourceID'),
            sourceURL: v.get('sourceURL'),
            isEnable: v.get('isEnable'),
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