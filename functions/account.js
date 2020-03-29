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

    let asc = fields.asc || 'createdAt'
    let desc = fields.desc || 'createdAt'
    if (asc) {
        query.ascending(asc)
    }
    if (desc) {
        query.descending(desc)
    }

    return await query.first()
})

AV.Cloud.define('getAccountIn', async function (req) {
    let query = new AV.Query('Account')

    let fields = req.params || {}
    let asc = fields.asc || 'createdAt'
    let desc = fields.desc || 'createdAt'
    if (asc) {
        query.ascending(asc)
    }
    if (desc) {
        query.descending(desc)
    }

    return await query.containedIn('objectId', ids).find()
})

AV.Cloud.define('getAccountAll', async function (req) {
    let query = new AV.Query('Account')

    let fields = req.params || {}
    let asc = fields.asc || 'createdAt'
    let desc = fields.desc || 'createdAt'
    if (asc) {
        query.ascending(asc)
    }
    if (desc) {
        query.descending(desc)
    }

    return await query.find()
})