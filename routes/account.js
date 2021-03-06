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

    let [getSubscribeAllError, subscribes] = await util.execute(AV.Cloud.run('getSubscribeAll', params))
    if (getSubscribeAllError) {
        subscribes = []
    }

    let [getLinkAllError, links] = await util.execute(AV.Cloud.run('getLinkAll', params))
    if (getLinkAllError) {
        links = []
    }

    res.render('account', {
        accounts: accounts.map(v => {
            return {
                id: v.get('objectId'),
                remarks: v.get('remarks'),
                serviceType: v.get('serviceType'),
                host: v.get('host'),
                port: v.get('port'),
                method: v.get('method'),
                protocol: v.get('protocol'),
            }
        }),
        subscribes: subscribes.map(v => {
            return {
                id: v.get('objectId'),
                remarks: v.get('remarks'),
                url: v.get('url'),
                isEnable: v.get('isEnable'),
            }
        }),
        links: links.map(v => {
            return {
                id: v.get('objectId'),
                linkId: v.get('linkId'),
                sourceAccounts: v.get('sourceAccounts'),
                isEnable: v.get('isEnable'),
            }
        }),
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