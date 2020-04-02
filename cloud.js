const AV = require('leanengine')
const fs = require('fs')
const path = require('path')
const rq = require('request-promise')
const util = require('./utils/util')

/**
 * 加载 functions 目录下所有的云函数
 */
fs.readdirSync(path.join(__dirname, 'functions')).forEach(file => {
  require(path.join(__dirname, 'functions', file))
})

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function (req) {
  return 'Hello world!'
})

AV.Cloud.define('request', async function (req) {
  let fields = req.params || {}
  let method = (fields.method || 'get').toLocaleUpperCase()
  let url = fields.url
  let headers = fields.header || {}
  let qs = fields.qs || {}

  if (!url) {
    return '缺少参数url'
  }

  let options = {
    method,
    url,
    headers,
    qs,
  }

  if (method === 'POST') {
    options.body = fields.body || {}
  }
  let [err, res] = await util.request(options)
  if (err) {
    console.error('[request]', err.message)
    return '请求失败'
  } else {
    console.log('[request]', '请求成功')
    return '请求成功'
  }
})