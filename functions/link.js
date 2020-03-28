const AV = require('leanengine')
const util = require('../utils/util')

AV.Cloud.define('getLink', async function (req) {
    let query = new AV.Query('Link')
    let fields = req.params || {}
    Object.keys(fields).map(key => {
        query.equalTo(key, fields[key])
    })
    return await query.first()
})

AV.Cloud.define('getLinkIn', async function (req) {
    let query = new AV.Query('Link')
    return await query.containedIn('objectId', req.params.ids).find()
})

AV.Cloud.define('getLinkAll', async function (req) {
    let query = new AV.Query('Link')
    return await query.find()
})

AV.Cloud.define('addLink', async function (req) {
    let linkId = req.params.linkId
    let content = req.params.content
    let ids = req.params.ids
    let urls = req.params.urls

    let link = new AV.Object('Link')
    link.set('linkId', linkId)
    link.set('content', content)
    link.set('sourceID', ids)
    link.set('sourceURL', urls)
    let [err, res] = await util.execute(link.save())
    if (err) {
        console.error('[addLink]', err.message)
        return false
    } else {
        console.log(`[addLink] 保存成功 objectId: ${res.id}`)
        return res
    }
})