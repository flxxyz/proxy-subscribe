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
        message: message,
        state: state,
        data: data || {},
    }
}

router.post('/generate', async function (req, res, next) {
    let r = response()

    let ids = []
    if (req.body.ids && typeof req.body.ids !== 'object') {
        ids = [...new Set(req.body.ids.split(',').filter(v => v !== ''))]
    }

    if (ids.length === 0) {
        [r.message, r.state] = ['缺少参数ids', 3]
        return res.send(r)
    }

    let [getAccountInError, accounts] = await util.execute(AV.Cloud.run('getAccountIn', {
        ids
    }))

    if (getAccountInError) {
        accounts = []
    }

    let urls = accounts.map(v => {
        let g = generate[`generate${v.get('serviceType').replace(/^\S/, s => s.toUpperCase())}`]
        return g(util.clone(template[v.get('serviceType')]), v)
    })

    let linkId = uuid()
    global.cache[linkId] = {
        time: new String(Math.round(new Date().getTime() / 1000)),
        content: generate.base64(urls.join('\n')),
    }

    let [addLinkError, isAdded] = await util.execute(AV.Cloud.run('addLink', {
        linkId: linkId,
        content: global.cache[linkId].content,
        sourceID: ids,
        sourceURL: urls,
    }))

    if (addLinkError) {
        [r.message, r.state] = ['生成订阅地址出现错误', 2]
    } else {
        if (!isAdded) {
            [r.message, r.state, r.data] = ['生成订阅地址失败', 1]
        } else {
            [r.message, r.state, r.data] = ['生成订阅地址成功', 0, {
                link: isAdded
            }]
        }
    }

    return res.json(r)
})

router.post('/import', function (req, res, next) {
    return res.json({
        method: 'import',
        body: req.body,
    })
})

router.post('/delete', async function (req, res, next) {
    let r = response()

    let ids = []
    if (req.body.ids && util.Type.isString(req.body.ids)) {
        ids = [...new Set(req.body.ids.split(',').filter(v => v !== ''))]
    }

    if (ids.length === 0) {
        [r.message, r.state] = ['缺少参数ids', 3]
        return res.send(r)
    }

    if (!req.body.className) {
        [r.message, r.state] = ['缺少参数className', 3]
        return res.json(r)
    }

    let className = req.body.className
    if (!['Account', 'Link'].includes(className)) {
        [r.message, r.state] = ['不存在的数据表', 3]
        return res.json(r)
    }

    let [err, isDeleted] = await util.execute(AV.Cloud.run(`delete${className}`, {
        ids
    }))

    if (err) {
        [r.message, r.state] = ['删除出现错误', 2]
        return res.json(r)
    } else {
        if (!isDeleted) {
            [r.message, r.state, r.data] = ['删除失败', 1]
        } else {
            [r.message, r.state, r.data] = ['删除成功', 0, {
                ids: isDeleted
            }]
        }
    }

    return res.json(r)
})

module.exports = router