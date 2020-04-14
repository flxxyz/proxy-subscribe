const AV = require('leanengine')
const util = require('../utils/util')

let tableName = 'Link'
if (process.env.LEANCLOUD_APP_ENV === 'development') {
    tableName = 'LinkDev'
}

AV.Cloud.define('getLink', async function (req) {
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

AV.Cloud.define('getLinkIn', async function (req) {
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

AV.Cloud.define('getLinkAll', async function (req) {
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

AV.Cloud.define('getLinkContent', async function (req) {
    let fields = req.params || {}
    let linkId = fields.linkId || ''

    if (!linkId) {
        return ''
    }

    let [err, link] = await util.execute(AV.Cloud.run('getLink', {
        linkId
    }))

    if (err) {
        return ''
    }

    if (!link) {
        return ''
    }

    if (link.get('isEnable')) {
        return ''
    }

    return link.get('content')
})

AV.Cloud.define('addLink', async function (req) {
    let linkId = req.params.linkId
    let content = req.params.content
    let sourceID = req.params.sourceID
    let sourceURL = req.params.sourceURL
    let user = req.params.user

    let link = new AV.Object(tableName)
    link.set('linkId', linkId)
    link.set('content', content)
    link.set('sourceID', sourceID)
    link.set('sourceURL', sourceURL)
    link.set('user', user)
    let [err, res] = await util.execute(link.save())
    if (err) {
        console.error('[addLink]', err.message)
        return false
    } else {
        console.log(`[addLink] 保存成功 objectId: ${res.id}`)
        return res
    }
})

AV.Cloud.define('deleteLink', async function (req) {
    let fields = req.params || {}
    let ids = fields.ids || []

    let [err, links] = await util.execute(AV.Cloud.run('getLinkIn', {
        ids
    }))

    if (err) {
        return false
    } else {
        await AV.Object.destroyAll(links)
        return links.map(v => v.get('objectId'))
    }
})