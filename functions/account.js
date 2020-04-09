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
        ids = accounts.map(v => v.get('objectId'))
        return ids
    }
})

AV.Cloud.define('addAccountIn', async function (req) {
    let fields = req.params || {}
    let accounts = fields.accounts || []

    let objects = []
    accounts.forEach(account => {
        if (account !== '') {
            let link = new AV.Object(tableName)
            link.set('host', account.host)
            link.set('port', account.port)
            link.set('remarks', decodeURIComponent(account.remarks))
            link.set('serviceType', account.serviceType)
            link.set('ssrSetting', account.ssrSetting || {})
            link.set('vmessSetting', account.vmessSetting || {})
            link.set('socksSetting', account.socksSetting || {})
            objects.push(link)
        }
    })

    let [err, res] = await util.execute(AV.Object.saveAll(objects))
    if (err) {
        return false
    } else {
        return res
    }
})