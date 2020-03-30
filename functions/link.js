const AV = require('leanengine')
const util = require('../utils/util')

AV.Cloud.define('getLink', async function (req) {
    let query = new AV.Query('Link')
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

AV.Cloud.define('getLinkIn', async function (req) {
    let query = new AV.Query('Link')

    let fields = req.params || {}
    let ids = fields.ids || []
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

AV.Cloud.define('getLinkAll', async function (req) {
    let query = new AV.Query('Link')

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

AV.Cloud.define('addLink', async function (req) {
    let linkId = req.params.linkId
    let content = req.params.content
    let sourceID = req.params.sourceID
    let sourceURL = req.params.sourceURL

    let link = new AV.Object('Link')
    link.set('linkId', linkId)
    link.set('content', content)
    link.set('sourceID', sourceID)
    link.set('sourceURL', sourceURL)
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
        ids = links.map(v => v.get('objectId'))
        return ids
    }
})