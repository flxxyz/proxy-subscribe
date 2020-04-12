const AV = require('leanengine')
const util = require('../utils/util')

let tableName = 'Account'
if (process.env.LEANCLOUD_APP_ENV === 'development') {
    tableName = 'AccountDev'
}

AV.Cloud.define('getAccount', async function (req) {
    let query = new AV.Query(tableName)
    let fields = req.params || {}
    Object.keys(fields).forEach(key => {
        if (!['sort'].includes(key)) {
            query.equalTo(key, fields[key])
        }
    })

    let sort = fields.sort || 1
    if (sort) {
        query.ascending('createdAt')
    } else {
        query.descending('createdAt')
    }

    return await query.first()
})

AV.Cloud.define('getAccountIn', async function (req) {
    let query = new AV.Query(tableName)

    let fields = req.params || {}
    let ids = fields.ids || []
    let sort = fields.sort || 1
    if (sort) {
        query.ascending('createdAt')
    } else {
        query.descending('createdAt')
    }

    return await query.containedIn('objectId', ids).find()
})

AV.Cloud.define('getAccountAll', async function (req) {
    let query = new AV.Query(tableName)

    let fields = req.params || {}
    let sort = fields.sort || 1
    if (sort) {
        query.ascending('createdAt')
    } else {
        query.descending('createdAt')
    }

    return await query.find()
})

AV.Cloud.define('deleteAccount', async function (req) {
    let fields = req.params || {}
    let ids = fields.ids || []

    let [err, accounts] = await util.execute(AV.Cloud.run('getAccountIn', {
        ids
    }))

    if (err) {
        return false
    } else {
        await AV.Object.destroyAll(accounts)
        return accounts.map(v => v.get('objectId'))
    }
})

AV.Cloud.define('addAccountIn', async function (req) {
    let fields = req.params || {}
    let accounts = fields.accounts || []

    let objects = []
    accounts.forEach(account => {
        if (account !== '') {
            let a = new AV.Object(tableName)
            a.set('host', account.host)
            a.set('port', account.port)
            a.set('remarks', decodeURIComponent(account.remarks))
            a.set('serviceType', account.serviceType)
            a.set('ssrSetting', account.ssrSetting || {})
            a.set('vmessSetting', account.vmessSetting || {})
            a.set('socksSetting', account.socksSetting || {})
            objects.push(a)
        }
    })

    let [err, res] = await util.execute(AV.Object.saveAll(objects))
    if (err) {
        return false
    } else {
        return res
    }
})