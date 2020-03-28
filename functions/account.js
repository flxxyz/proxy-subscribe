const AV = require('leanengine')
const util = require('../utils/util')

AV.Cloud.define('getAccount', async function (req) {
    let query = new AV.Query('Account')
    let fields = req.params || {}
    Object.keys(fields).map(key => {
        query.equalTo(key, fields[key])
    })
    return await query.first()
})

AV.Cloud.define('getAccountIn', async function (req) {
    let query = new AV.Query('Account')
    return await query.containedIn('objectId', req.params.ids).find()
})

AV.Cloud.define('getAccountAll', async function (req) {
    let query = new AV.Query('Account')
    return await query.find()
})