const AV = require('leanengine')
const util = require('../utils/util')

AV.Cloud.define('getAccount', async function (req) {
    let query = new AV.Query('Account')
    let fields = req.params || {}
    Object.keys(fields).forEach(key => {
        if (!['asc', 'desc'].includes(key)) {
            query.equalTo(key, fields[key])
        }
    })

    if (req.params.asc) {
        query.ascending(req.params.asc)
    }
    if (req.params.desc) {
        query.descending(req.params.desc)
    }

    return await query.first()
})

AV.Cloud.define('getAccountIn', async function (req) {
    let query = new AV.Query('Account')

    if (req.params.asc) {
        query.ascending(req.params.asc)
    }
    if (req.params.desc) {
        query.descending(req.params.desc)
    }

    return await query.containedIn('objectId', req.params.ids).find()
})

AV.Cloud.define('getAccountAll', async function (req) {
    let query = new AV.Query('Account')

    if (req.params.asc) {
        query.ascending(req.params.asc)
    }
    if (req.params.desc) {
        query.descending(req.params.desc)
    }

    return await query.find()
})