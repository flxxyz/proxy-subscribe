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
    Object.keys(fields).forEach(key => {
        if (!['sort', 'ids'].includes(key)) {
            query.equalTo(key, fields[key])
        }
    })

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

AV.Cloud.define('deleteAccountOther', async function (req) {
    let query = new AV.Query(tableName)

    let fields = req.params || {}
    Object.keys(fields).forEach(key => query.equalTo(key, fields[key]))
    let [err, accounts] = await util.execute(query.find())

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
            a.set('host', account.host.toString())
            a.set('port', account.port.toString())
            a.set('remarks', decodeURIComponent(account.remarks))
            a.set('serviceType', account.serviceType)
            a.set('setting', account.setting || {})
            a.set('sourceURL', account.sourceURL)
            a.set('method', account.method)
            a.set('protocol', account.protocol)
            a.set('user', account.user)
            a.set('subscribe', account.subscribe)
            objects.push(a)
        }
    })

    // console.log(objects)

    let [err, res] = await util.execute(AV.Object.saveAll(objects))
    if (err) {
        console.log(err.message)
        return false
    } else {
        if (!res || Object.keys(res).length === 0) {
            return false
        } else {
            return res
        }
    }
})