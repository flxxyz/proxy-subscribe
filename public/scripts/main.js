var getElement = function (selector) {
    return document.querySelector(selector)
}

var getAll = function (selector) {
    return document.querySelectorAll(selector)
}

var Type = (function (init) {
    Type = new Function()
    Type.prototype = {
        types: ['Object', 'Array', 'String', 'Number', 'Boolean', 'Function', 'RegExp', 'Date', 'Undefined', 'Null', 'Symbol', 'Blob', 'ArrayBuffer'],
    }
    init = Type.prototype.init = function () {
        this.types.forEach(type => {
            this[`is${type}`] = (p) => Object.prototype.toString.call(p).slice(8, -1) === type
        })
    }
    init.prototype = Type.prototype

    return new Type.prototype.init()
})()

var Request = (function (init) {
    Request = function (opts) {
        opts = opts || {}
        opts.method = (opts.method || 'get').toLocaleUpperCase()
        opts.url = opts.url || ''
        opts.async = opts.async || true
        opts.timeout = opts.async ? (opts.timeout || 5000) : 0
        opts.dataType = opts.async ? (opts.dataType || 'text') : ''
        opts.data = opts.data || {}
        opts.queryString = (opts.queryString || opts.qs) || {}
        opts.header = opts.header || {}
        opts.success = opts.success || function () {}
        opts.fail = opts.fail || function (err) {
            console.log('请求错误', err)
        }
        opts.complete = opts.complete || function () {}
        opts.ontimeout = function (e) {
            console.log('请求超时', e)
        }

        if (!opts.url || !Type.isString(opts.url)) {
            return
        }

        return new Request.prototype.init(opts)
    }

    Request.prototype = {
        param: function (data, masterKey = '') {
            if (Type.isObject(data)) {
                let p = []
                for (let [key, value] of Object.entries(data)) {
                    if (masterKey != '') {
                        key = `${masterKey}[${key}]`
                    }
                    p.push(`${this.param(value, key)}`)
                }
                return p.join('&')
            } else {
                if (Array.isArray(data)) {
                    return Array.from(data, value => this.param(value, `${masterKey}[]`)).join('&')
                } else {
                    if (Type.isString(data) || Type.isNumber(data) || Type.isBoolean(data)) {
                        return `${encodeURIComponent(masterKey)}=${encodeURIComponent(data.toString())}`
                    } else {
                        return ''
                    }
                }
            }
        },
        blob: function (data) {
            return new Blob([JSON.stringify(data)], {
                type: 'text/plain'
            })
        }
    }

    init = Request.prototype.init = function (opts) {
        var xhr = new XMLHttpRequest()
        xhr.timeout = opts.timeout
        xhr.responseType = opts.dataType
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    opts.success.call(undefined, xhr.response)
                } else {
                    opts.fail.call(undefined, xhr)
                }
            }
        }
        xhr.onload = (e) => opts.complete.call(undefined, e.target)
        xhr.ontimeout = (e) => opts.ontimeout.call(undefined, e.target)

        switch (opts.dataType) {
            case 'blob':
                console.log('[dataType] blob')
                opts.data = this.blob(opt.data)
                break;
            case 'arraybuffer':
                console.log('[dataType] arraybuffer')
                break;
            case 'json':
                console.log('[dataType] json')
                opts.header['Content-Type'] = 'application/json; charset=UTF-8'
                opts.data = JSON.stringify(opts.data)
                break;
            default:
                console.log('[dataType] default')
                break;
        }

        switch (opts.method) {
            case 'PUT':
                break;
            case 'PATCH':
                break;
            case 'COPY':
                break;
            case 'HEAD':
                break;
            case 'OPTIONS':
                break;
            case 'LINK':
                break;
            case 'DELETE':
                break;
            case 'POST':
                console.log('[method] POST')
                if (!(Object.keys(opts.header)
                        .map(v => v.toLocaleLowerCase())
                        .includes('content-type'))) {
                    opts.header['content-type'] = 'application/x-www-form-urlencoded'
                    opts.data = this.param(opts.data)
                }
                break;
            case 'GET':
            default:
                console.log('[method] GET')
                opts.data = null
                break;
        }

        opts.queryString = this.param(opts.queryString)
        opts.url += opts.queryString ? `?${opts.queryString}` : ''

        xhr.open(opts.method, opts.url, opts.async)
        Object.keys(opts.header).forEach(key => {
            xhr.setRequestHeader(key, opts.header[key])
        })
        console.log('[send]', opts.url)
        xhr.send(opts.data)
    }

    init.prototype = Request.prototype

    return Request
})()