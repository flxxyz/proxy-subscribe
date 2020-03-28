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
  let method = (req.params.method || 'get').toLocaleUpperCase()
  let url = req.params.url
  let headers = req.params.header || {}
  let qs = req.params.qs || {}

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
    options.body = req.params.body || {}
  }
  let [err, res] = await util.execute(rq(options))
  if (err) {
    console.error('[request]', err.message)
    return '请求失败'
  } else {
    console.log('[request]', '请求成功')
    return '请求成功'
  }
})