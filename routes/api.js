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

router.post('/generate', async function (req, res, next) {
    let r = response()

    let ids = []
    if (req.body.ids && typeof req.body.ids !== 'object') {
        ids = [...new Set(req.body.ids.split(',').filter(v => v !== ''))]
    }

    if (ids.length === 0) {
        [r.message, r.state] = ['缺少参数ids', 3]
        return res.json(r)
    }

    let [getAccountInError, accounts] = await execute(AV.Cloud.run('getAccountIn', {
        ids
    }))

    if (getAccountInError) {
        accounts = []
    }

    let urls = []
    let sourceAccounts = []
    accounts.forEach(a => {
        a = a.toJSON()

        urls.push(a.sourceURL)

        sourceAccounts.push({
            remarks: a.remarks,
            protocol: a.protocol,
            method: a.method,
            port: a.port,
            host: a.host,
            setting: a.setting,
            sourceURL: a.sourceURL,
            id: a.objectId,
        })
    })

    if (accounts.length > 0) {
        let [addLinkError, isAdded] = await execute(AV.Cloud.run('addLink', {
            linkId: uuid(),
            content: encode(urls.join('\n')),
            sourceAccounts,
            user: req.currentUser,
        }))

        if (addLinkError) {
            [r.message, r.state] = ['生成订阅地址出现错误', 2]
        } else {
            if (!isAdded) {
                [r.message, r.state, r.data] = ['生成订阅地址失败', 1]
            } else {
                [r.message, r.state, r.data] = ['生成订阅地址成功', 0, {
                    linkId: isAdded.get('linkId')
                }]
            }
        }
    } else {
        [r.message, r.state, r.data] = ['不存在的服务器列表', 4]
    }

    return res.json(r)
})

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

    let [getSubscribeAllError, subscribes] = await execute(AV.Cloud.run('getSubscribeAll', params))
    if (getSubscribeAllError) {
        subscribes = []
    }

    let [getLinkAllError, links] = await execute(AV.Cloud.run('getLinkAll', params))
    if (getLinkAllError) {
        links = []
    }

    r.data = {
        accounts: accounts.map(v => {
            return {
                id: v.get('objectId'),
                remarks: v.get('remarks'),
                serviceType: v.get('serviceType'),
                host: v.get('host'),
                port: v.get('port'),
                method: v.get('method'),
                protocol: v.get('protocol'),
            }
        }),
        subscribes: subscribes.map(v => {
            return {
                id: v.get('objectId'),
                remarks: v.get('remarks'),
                url: v.get('url'),
                isEnable: v.get('isEnable'),
            }
        }),
        links: links.map(v => {
            return {
                id: v.get('objectId'),
                linkId: v.get('linkId'),
                sourceAccounts: v.get('sourceAccounts'),
                isEnable: v.get('isEnable'),
            }
        }),
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
            serverList.forEach(sourceURL => {
                let [type, data, queryString] = uncompose(sourceURL)
                if (type !== 'ss') {
                    let funcName = `deserialize${type.replace(/^\S/, s => s.toUpperCase())}`
                    arr.push(Object.assign({
                        sourceURL
                    }, generate[funcName](data, queryString)))
                }
            })

            accounts.push(...(arr.map(v => {
                v.subscribe = subscribes[i]
                v.user = req.currentUser
                return v
            })))
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
        if (!result || Object.keys(result).length === 0) {
            [r.message, r.state] = ['添加失败', 1]
        } else {
            [r.message, r.state, r.data] = ['添加成功', 0, result.map(v => {
                let val = v.toJSON()
                delete val.user
                delete val.subscribe
                return val
            })]
        }
    }

    return res.json(r)
})

router.post('/account/clear', async function (req, res, next) {
    let r = response()

    let [err, result] = await execute(AV.Cloud.run('deleteAccountOther', {
        user: req.currentUser
    }))

    if (err) {
        [r.message, r.state] = ['清空出现错误', 2]
        return res.json(r)
    } else {
        if (!result || Object.keys(result).length === 0) {
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