const rq = require('request-promise')
const Base64 = require('js-base64').Base64

import * as qs from './url'

const clone = (data) => {
    if (Array.isArray(data)) {
        let arr = []
        data.forEach((value, index) => arr[index] = clone(value))
        return arr
    } else if (data instanceof Object) {
        let obj = {}
        for (let key in data) {
            obj[key] = clone(data[key])
        }
        return obj

    } else {
        return data
    }

}

const pagination = () => {

}

const execute = (promise) => {
    return promise.then(data => [null, data])
        .catch(err => [err, null])
}

const Type = (function (Type) {
    Type = function () {
        this.types.forEach(type => {
            this[`is${type}`] = (p) => Object.prototype.toString.call(p).slice(8, -1) === type
        })
    }
    Type.prototype = {
        types: ['Object', 'Array', 'String', 'Number', 'Boolean', 'Function', 'RegExp', 'Date', 'Undefined', 'Null', 'Symbol', 'Blob', 'ArrayBuffer'],
    }
    return new Type()
})()

const request = (opts) => {
    opts = opts || {}
    opts.method = (opts.method || 'get').toLocaleUpperCase()
    opts.url = opts.url
    opts.headers = opts.headers || {}
    opts.qs = opts.qs || {}

    if (opts.method === 'POST') {
        opts.body = opts.body || {}
    }

    return execute(rq(opts))
}

const encode = (data) => {
    return Base64.encode(data)
}

const decode = (data) => {
    return Base64.decode(data)
}

const compose = (type, data, qs = '') => {
    return `${type}://${encode(data)}${qs}`
}

const uncompose = (url) => {
    let [type, value] = url.split('://')
    let [content, qs] = value.split('?')
    return [type, decode(content), qs.decode(qs || '')]
}

const response = (message = 'success', state = 0, data) => {
    return {
        message: message,
        state: state,
        data: data || {},
    }
}

export {
    clone,
    pagination,
    execute,
    Type,
    request,
    compose,
    uncompose,
    encode,
    decode,
    response,
}