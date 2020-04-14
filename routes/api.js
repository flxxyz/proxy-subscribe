import * as generate from '../utils/generate'
import {
    clone,
    execute,
    Type,
    encode,
    decode,
    uncompose,
    response,
    request,
} from '../utils/util'
var router = require('express').Router()
var AV = require('leanengine')
var uuid = require('uuid')

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

// router.post('/generate', async function (req, res, next) {
//     let r = response()

//     let ids = []
//     if (req.body.ids && typeof req.body.ids !== 'object') {
//         ids = [...new Set(req.body.ids.split(',').filter(v => v !== ''))]
//     }

//     if (ids.length === 0) {
//         [r.message, r.state] = ['缺少参数ids', 3]
//         return res.json(r)
//     }

//     let [getAccountInError, accounts] = await execute(AV.Cloud.run('getAccountIn', {
//         ids
//     }))

//     if (getAccountInError) {
//         accounts = []
//     }

//     let urls = accounts.map(v => {
//         let func = generate[`serialize${v.get('serviceType').replace(/^\S/, s => s.toUpperCase())}`]
//         return func(clone(template[v.get('serviceType')]), v)
//     })

//     let [addLinkError, isAdded] = await execute(AV.Cloud.run('addLink', {
//         linkId: uuid(),
//         content: encode(urls.join('\n')),
//         sourceID: ids,
//         sourceURL: urls,
//         user: req.currentUser,
//     }))

//     if (addLinkError) {
//         [r.message, r.state] = ['生成订阅地址出现错误', 2]
//     } else {
//         if (!isAdded) {
//             [r.message, r.state, r.data] = ['生成订阅地址失败', 1]
//         } else {
//             [r.message, r.state, r.data] = ['生成订阅地址成功', 0, {
//                 linkId: isAdded.get('linkId')
//             }]
//         }
//     }

//     return res.json(r)
// })

router.post('/delete', async function (req, res, next) {
    let r = response()

    let ids = []
    if (req.body.ids && Type.isString(req.body.ids)) {
        ids = [...new Set(req.body.ids.split(',').filter(v => v !== ''))]
    }

    if (ids.length === 0) {
        [r.message, r.state] = ['缺少参数ids', 3]
        return res.json(r)
    }

    if (!req.body.className) {
        [r.message, r.state] = ['缺少参数className', 3]
        return res.json(r)
    }

    let className = req.body.className.toLocaleLowerCase().replace(/^\S/, s => s.toUpperCase())
    if (!['Account', 'Link', 'Subscribe'].includes(className)) {
        [r.message, r.state] = ['不存在的数据表', 3]
        return res.json(r)
    }

    let [err, isDeleted] = await execute(AV.Cloud.run(`delete${className}`, {
        ids
    }))

    if (err) {
        [r.message, r.state] = ['删除出现错误', 2]
    } else {
        if (!isDeleted) {
            [r.message, r.state] = ['删除失败', 1]
        } else {
            [r.message, r.state, r.data] = ['删除成功', 0, {
                ids: isDeleted
            }]
        }
    }

    return res.json(r)
})

router.get('/refresh', async function (req, res, next) {
    let r = response()

    let params = {
        user: req.currentUser
    }
    let [getAccountAllError, accounts] = await execute(AV.Cloud.run('getAccountAll', params))

    if (getAccountAllError) {
        accounts = []
    }

    accounts.forEach((v, i) => {
        let serviceType = v.get('serviceType')
        accounts[i] = {
            id: v.get('objectId'),
            remarks: v.get('remarks'),
            serviceType: serviceType,
            host: v.get('host'),
            port: v.get('port'),
        }

        if (v.get(`${serviceType}Setting`).isShadowrocket) {
            accounts[i].method = 'auto'
            accounts[i].protocol = v.get(`${serviceType}Setting`).net
        } else {
            accounts[i].method = v.get(`${serviceType}Setting`).method
            accounts[i].protocol = v.get(`${serviceType}Setting`).obfs
        }
    })

    let [getSubscribeAllError, subscribes] = await execute(AV.Cloud.run('getSubscribeAll', params))

    if (getSubscribeAllError) {
        subscribes = []
    }

    subscribes.forEach((v, i) => {
        subscribes[i] = {
            id: v.get('objectId'),
            remarks: v.get('remarks'),
            url: v.get('url'),
            isEnable: v.get('isEnable'),
        }
    })

    let [getLinkAllError, links] = await execute(AV.Cloud.run('getLinkAll', params))

    if (getLinkAllError) {
        links = []
    }

    links.forEach((v, i) => {
        links[i] = {
            id: v.get('objectId'),
            linkId: v.get('linkId'),
            sourceID: v.get('sourceID'),
            sourceURL: v.get('sourceURL'),
            isEnable: v.get('isEnable'),
        }
    })

    r.data = {
        accounts,
        subscribes,
        links,
    }

    return res.json(r)
})

router.post('/subscribe/import', async function (req, res, next) {
    let r = response()
    let remarks = req.body.remarks || ''
    let url = req.body.url || ''

    if (!remarks) {
        [r.message, r.state] = ['缺少参数remarks', 3]
        return res.json(r)
    }

    if (!url) {
        [r.message, r.state] = ['缺少参数url', 3]
        return res.json(r)
    }

    let [err, result] = await execute(AV.Cloud.run('addSubscribe', {
        remarks,
        url,
        user: req.currentUser,
    }))

    if (err) {
        [r.message, r.state] = [`添加出现错误${err.message}`, 2]
    } else {
        if (!res) {
            [r.message, r.state] = ['添加失败', 1]
        } else {
            [r.message, r.state, r.data] = ['添加成功', 0, {
                id: result.get('objectId')
            }]
        }
    }

    return res.json(r)
})

router.post('/subscribe/update', async function (req, res, next) {
    let r = response()

    let [getSubscribeAllError, subscribes] = await execute(AV.Cloud.run('getSubscribeAll', {
        isEnable: true,
        user: req.currentUser,
    }))

    if (getSubscribeAllError) {
        [r.message, r.state] = ['获取订阅出错', 2]
        return res.json(r)
    }

    let urls = []
    subscribes.forEach(s => urls.push(s.get('url')))

    let accounts = []
    let contents = await generate.updateSubscribe(urls)
    contents.forEach(async (c, i) => {
        let decodeContent = decode(c).split('\n').filter(v => v !== '')
        if (decodeContent.length > 0) {
            let serverList = decodeContent
            if (!decodeContent[0].indexOf('STATUS=') && !decodeContent[1].indexOf('REMARKS=')) {
                serverList = decodeContent.slice(2)
            }

            let arr = []
            serverList.forEach(v => {
                let [type, data, queryString] = uncompose(v)
                if (type !== 'ss') {
                    let funcName = `deserialize${type.replace(/^\S/, s => s.toUpperCase())}`
                    arr.push(generate[funcName](data, queryString))
                }
            })

            let subscribe = subscribes[i]
            arr.forEach((v, i) => {
                arr[i].subscribe = subscribe
                arr[i].user = req.currentUser
            })
            accounts.push(...arr)
        }
    })

    // 清除老旧的订阅内容
    subscribes.forEach(async s => await AV.Cloud.run('deleteAccountOther', {
        subscribe: s,
        user: req.currentUser,
    }))

    let [err, result] = await execute(AV.Cloud.run('addAccountIn', {
        accounts,
    }))

    if (err) {
        [r.message, r.state] = ['添加出现错误', 2]
        return res.json(r)
    } else {
        if (!result) {
            [r.message, r.state] = ['添加失败', 1]
        } else {
            [r.message, r.state] = ['添加成功', 0]
        }
    }

    return res.json(r)
})

router.post('/subscribe/clear', async function (req, res, next) {
    let r = response()

    let [err, result] = await execute(AV.Cloud.run('deleteAccountOther', {
        user: req.currentUser
    }))

    if (err) {
        [r.message, r.state] = ['清空出现错误', 2]
        return res.json(r)
    } else {
        if (!result) {
            [r.message, r.state] = ['清空失败', 1]
        } else {
            [r.message, r.state] = ['清空成功', 0]
        }
    }

    return res.json(r)
})

router.post('/:id/update', async function (req, res, next) {
    let r = response()
    let id = req.params.id
    if (!(/^[a-z0-9]{24}$/.test(id))) {
        [r.message, r.state] = ['不符合的id', 4]
        return res.json(r)
    }

    let isEnable = req.body.isEnable || false

    if (!req.body.className) {
        [r.message, r.state] = ['缺少参数className', 3]
        return res.json(r)
    }

    let className = req.body.className.toLocaleLowerCase().replace(/^\S/, s => s.toUpperCase())
    if (!['Link', 'Subscribe'].includes(className)) {
        [r.message, r.state] = ['不存在的数据表', 3]
        return res.json(r)
    }

    let [err, result] = await execute(AV.Cloud.run(`get${className}`, {
        objectId: id,
    }))

    if (err) {
        [r.message, r.state] = ['查询出错', 2]
        return res.json(r)
    }

    if (!result) {
        [r.message, r.state] = ['没有该条订阅', 1]
        return res.json(r)
    }

    result.set('isEnable', parseInt(isEnable) ? true : false)
    let [saveError, _] = await execute(result.save())
    if (saveError) {
        [r.message, r.state] = [`更新失败${saveError.message}`, 1]
    } else {
        [r.message, r.state] = ['更新成功', 0]
    }

    return res.json(r)
})

module.exports = router