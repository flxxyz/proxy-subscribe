var router = require('express').Router()
var AV = require('leanengine')
var util = require('../utils/util')
var generate = require('../utils/generate')
var uuid = require('uuid')

var Account = AV.Object.extend('Account')
var Link = AV.Object.extend('Link')

const template = {
    vmess: {
        v: '2',
        ps: '',
        add: '',
        port: '',
        id: '',
        aid: '4',
        net: 'tcp',
        type: 'none',
        host: '',
        path: '/',
        tls: '',
    },
    ssr: {
        password: '',
        encrypt: 'none',
        protocol: 'origin',
        protocolParam: '',
        obfs: 'plain',
        obfsParam: '',
    },
    socks: {
        username: '',
        password: '',
    },
}

const settingTemplate = {
    vmess: {
        encrypt: 'auto',
        protocol: 'tcp',
        userId: '',
        alterId: '',
        type: 'none',
        host: '',
        path: '',
        tls: '',
    },
}

const response = (message = 'success', state = 0, data) => {
    return {
        message: '',
        state: state,
        data: data || {},
    }
}

router.post('/generate', async function (req, res, next) {
    let ids = []
    if (req.body.ids && typeof req.body.ids !== 'object') {
        ids = req.body.ids.split(',').filter(v => v !== '')
    }

    if (ids.length === 0) {
        return res.send(response('无ids', 1))
    }

    let query = new AV.Query(Account)
    let accounts = await query.containedIn('objectId', ids).find()

    let urls = []
    accounts.forEach((v, i) => {
        let g = generate[`generate${v.get('serviceType').replace(/^\S/, s => s.toUpperCase())}`]
        urls.push(g(util.clone(template[v.get('serviceType')]), v))
    })

    let linkId = uuid()
    global.map[linkId] = {
        time: new String(Math.round(new Date().getTime() / 1000)),
        content: generate.build(urls.join('\n')),
    }

    let link = new Link()
    link.set('linkId', linkId)
    link.set('content', global.map[linkId].content)
    link.set('source', urls)
    await link.save()

    return res.json(response('success', 0, {
        linkId: linkId,
    }))
})

router.post('/import', function (req, res, next) {
    return res.json({
        method: 'import',
        map: global.map
    })
})

module.exports = router