function getElement(selector) {
    return document.querySelector(selector)
}

function getAll(selector) {
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
        xhr.send(opts.data)
    }

    init.prototype = Request.prototype

    return Request
})()

function copy(value) {
    if (!value) return
    let input = document.createElement('input')
    document.body.appendChild(input)
    input.setAttribute('value', value)
    input.select()
    if (document.execCommand('copy')) {
        document.execCommand('copy')
        console.log('复制成功', value)
    }
    document.body.removeChild(input)
}

document.addEventListener('DOMContentLoaded', function () {
    var $dropdowns = getAll('.dropdown:not(.is-hoverable)')

    if ($dropdowns.length > 0) {
        $dropdowns.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                event.stopPropagation()
                $el.classList.toggle('is-active')
            })
        })

        document.addEventListener('click', function (event) {
            closeDropdowns()
        })
    }

    function closeDropdowns() {
        $dropdowns.forEach(function ($el) {
            $el.classList.remove('is-active')
        })
    }

    var $accounts = getAll('.account .remarks a')
    if ($accounts.length > 0) {
        $accounts.forEach(($el) => {
            $el.addEventListener('click', function (event) {
                var root = this.parentElement.parentElement
                var data = JSON.parse(root.querySelector('.source').dataset.data)

                var generate = new Generate()
                generate[data.serviceType](data)

                getElement('.modal-card-title').innerHTML = data.remarks

                $modalCardContents.forEach(function ($el) {
                    $el.classList.remove('is-hidden')
                    if (!$el.classList.contains(data.serviceType)) {
                        $el.classList.add('is-hidden')
                    }
                })
                $modal.classList.toggle('is-active')
            })
        })
    }

    var $subscribes = getAll('.subscribe .link-id a')
    if ($subscribes.length > 0) {
        $subscribes.forEach(($el) => {
            $el.addEventListener('click', function (event) {
                var root = this.parentElement.parentElement
                var data = JSON.parse(root.querySelector('.source').dataset.data)
                copy(`${window.location.origin}/link/${data.linkId}`)
            })
        })
    }

    var $subscribesSourceURL = getAll('.subscribe .urls .url')
    if ($subscribesSourceURL.length > 0) {
        $subscribesSourceURL.forEach($el => {
            $el.addEventListener('click', function (event) {
                copy(this.innerHTML)
            })
        })
    }

    var $chooses = getAll('.choose .checkbox input')
    var $chooseItems = getAll('.choose-item')
    if ($chooses.length > 0) {
        $chooses.forEach(($el) => {
            $el.addEventListener('click', function (event) {
                $chooseItems.forEach($item => {
                    if ($item.dataset.type === $el.classList[0]) {
                        var checkbox = $item.querySelector('.source')
                        checkbox.checked = !checkbox.checked
                    }
                })

            })
        })
    }

    var $generate = getAll('.generate')
    if ($generate.length > 0) {
        $generate.forEach($el => {
            $el.addEventListener('click', function (event) {
                var ids = []

                $chooseItems.forEach($item => {
                    var checkbox = $item.querySelector('.source')
                    if (checkbox.checked) {
                        var data = JSON.parse(checkbox.dataset.data)
                        ids.push(data.objectId)
                    }
                })

                if (ids.length > 0) {
                    Request({
                        method: 'post',
                        url: '/api/generate',
                        dataType: 'json',
                        data: {
                            ids: ids.join(','),
                        },
                        success: function (res) {
                            console.log('res:', res)
                        }
                    })
                }
            })
        })
    }

    var $modal = getElement('.modal')
    var $modalButtons = getAll('.modal-button')
    var $modalCloses = getAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button')
    var $modalCardContents = getAll('.modal-card-body .content')

    if ($modalButtons.length > 0) {
        $modalButtons.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                var target = $el.dataset.target
                openModal(target)
            })
        })
    }

    if ($modalCloses.length > 0) {
        $modalCloses.forEach(function ($el) {
            $el.addEventListener('click', closeModal)
        })
    }

    function openModal(target) {
        var $target = document.getElementById(target);
        document.documentElement.classList.add('is-clipped')
        $target.classList.add('is-active')
    }

    function closeModal() {
        document.documentElement.classList.remove('is-clipped')
        $modal.classList.remove('is-active')
    }
})