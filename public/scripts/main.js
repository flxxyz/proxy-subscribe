! function (e) {
    var proxy,
        d = document,
        t = [
            'Object',
            'Array',
            'String',
            'Number',
            'Boolean',
            'Function',
            'RegExp',
            'Date',
            'Undefined',
            'Null',
            'Symbol',
            'Blob',
            'ArrayBuffer'
        ]

    proxy = function (selector) {
        return new proxy.fn.init(selector, this)
    }

    proxy.getElement = (selector) => document.querySelector(selector)
    proxy.getElementAll = (selector) => document.querySelectorAll(selector)

    t.forEach(type => {
        proxy[`is${type}`] = (p) => Object.prototype.toString.call(p).slice(8, -1) === type
    })

    proxy.urlEncode = function (data, masterKey = '') {
        if (proxy.isObject(data)) {
            let p = []
            for (let [key, value] of Object.entries(data)) {
                if (masterKey != '') {
                    key = `${masterKey}[${key}]`
                }
                p.push(`${proxy.urlEncode(value, key)}`)
            }
            return p.join('&')
        } else {
            if (Array.isArray(data)) {
                return Array.from(data, value => proxy.urlEncode(value, `${masterKey}[]`)).join('&')
            } else {
                if (proxy.isString(data) || proxy.isNumber(data) || proxy.isBoolean(data)) {
                    return `${encodeURIComponent(masterKey)}=${encodeURIComponent(data.toString())}`
                } else {
                    return ''
                }
            }
        }
    }
    proxy.request = function (opts) {
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

        if (!opts.url || !proxy.isString(opts.url)) {
            return
        }

        return new proxy.request.prototype.init(opts)
    }

    proxy.request.prototype.init = function (opts) {
        this.blob = function (data) {
            return new Blob([JSON.stringify(data)], {
                type: 'text/plain'
            })
        }

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
                opts.data = this.blob(opt.data || {})
                break;
            case 'arraybuffer':
                console.log('[dataType] arraybuffer')
                break;
            case 'json':
                console.log('[dataType] json')
                opts.header['Content-Type'] = 'application/json; charset=UTF-8'
                opts.data = JSON.stringify(opts.data || {})
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
                    opts.data = proxy.urlEncode(opts.data)
                }
                break;
            case 'GET':
            default:
                console.log('[method] GET')
                opts.data = null
                break;
        }

        opts.queryString = proxy.urlEncode(opts.queryString)
        opts.url += opts.queryString ? `?${opts.queryString}` : ''

        xhr.open(opts.method, opts.url, opts.async)
        Object.keys(opts.header).forEach(key => {
            xhr.setRequestHeader(key, opts.header[key])
        })
        console.log('[send]', opts.url)
        xhr.send(opts.data)
    }

    proxy.fn = proxy.prototype = {
        get: (index) => {
            return this[index]
        },
    }

    proxy.fn.init = function (selector, e) {
        let nodes = d.querySelectorAll(selector)
        nodes.forEach((node, index) => {
            this[index] = node
        })

        return this
    }

    e.p = e.proxy = proxy
}(window)