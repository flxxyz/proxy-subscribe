const AV = require('leanengine')
const util = require('../utils/util')

let tableName = 'Subscribe'
if (process.env.LEANCLOUD_APP_ENV === 'development') {
    tableName = 'SubscribeDev'
}

AV.Cloud.define('getSubscribe', async function (req) {
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

AV.Cloud.define('getSubscribeIn', async function (req) {
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

AV.Cloud.define('getSubscribeAll', async function (req) {
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

AV.Cloud.define('addSubscribe', async function (req) {
    let remarks = req.params.remarks
    let url = req.params.url
    let user = req.params.user

    let subscribe = new AV.Object(tableName)
    subscribe.set('remarks', remarks)
    subscribe.set('url', url)
    subscribe.set('user', user)
    let [err, res] = await util.execute(subscribe.save())
    if (err) {
        console.error('[addSubscribe]', err.message)
        return false
    } else {
        console.log(`[addSubscribe] 保存成功 objectId: ${res.id}`)
        return res
    }
})

AV.Cloud.define('deleteSubscribe', async function (req) {
    let fields = req.params || {}
    let ids = fields.ids || []

    let [err, subscribes] = await util.execute(AV.Cloud.run('getSubscribeIn', {
        ids
    }))

    if (err) {
        return false
    } else {
        await AV.Object.destroyAll(subscribes)
        return subscribes.map(v => v.get('objectId'))
    }
})

AV.Cloud.define('deleteSubscribeOther', async function (req) {
    let query = new AV.Query(tableName)

    let fields = req.params || {}
    Object.keys(fields).forEach(key => query.equalTo(key, fields[key]))
    let [err, subscribes] = await util.execute(query.find())

    if (err) {
        return false
    } else {
        await AV.Object.destroyAll(subscribes)
        return subscribes.map(v => v.get('objectId'))
    }
})
