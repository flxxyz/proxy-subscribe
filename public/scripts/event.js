var copy = function (value) {
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
    var $dropdowns = proxy.getElementAll('.dropdown:not(.is-hoverable)')

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

    var $accounts = proxy.getElementAll('.account .remarks a')
    if ($accounts.length > 0) {
        $accounts.forEach(($el) => {
            $el.addEventListener('click', function (event) {
                var root = this.parentElement.parentElement
            })
        })
    }

    var $subscribes = proxy.getElementAll('.subscribe .link-id a')
    if ($subscribes.length > 0) {
        $subscribes.forEach(($el) => {
            $el.addEventListener('click', function (event) {
                var root = this.parentElement.parentElement
                var data = JSON.parse(root.querySelector('.source').dataset.data)
                copy(`${window.location.origin}/link/${data.linkId}`)
            })
        })
    }

    var $subscribesSourceURL = proxy.getElementAll('.subscribe .urls .url')
    if ($subscribesSourceURL.length > 0) {
        $subscribesSourceURL.forEach($el => {
            $el.addEventListener('click', function (event) {
                copy(this.innerHTML)
            })
        })
    }

    var $chooses = proxy.getElementAll('.choose')
    if ($chooses.length > 0) {
        $chooses.forEach(($el) => {
            $el.addEventListener('click', function (event) {
                proxy.getElementAll(`.${this.dataset.type} .checkbox`).forEach(checkbox => {
                    checkbox.checked = !checkbox.checked
                })
            })
        })
    }

    var $generate = proxy.getElementAll('.generate')
    if ($generate.length > 0) {
        $generate.forEach($el => {
            $el.addEventListener('click', function (event) {
                layer.msg('暂时无法使用')
                return;
                var ids = []
                proxy.getElementAll(`.account`).forEach($item => {
                    var checkbox = $item.querySelector('input.checkbox')
                    if (checkbox.checked) {
                        ids.push($item.querySelector('.account-id').value)
                    }
                })

                if (ids.length > 0) {
                    proxy.request({
                        method: 'post',
                        url: '/api/generate',
                        data: {
                            ids: ids.join(','),
                        },
                        success: function (res) {
                            console.log('res:', res)
                            refresh()
                        }
                    })
                }
            })
        })
    }

    var $clearAccount = proxy.getElementAll('.clear-account')
    if ($clearAccount.length > 0) {
        $clearAccount.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                if (proxy.getElementAll(`.${$el.dataset.type}`).length > 0) {
                    layer.confirm('', {
                        title: '清空',
                        content: '是否清除所有服务器？',
                        btn: ['确认', '取消']
                    }, function () {
                        proxy.request({
                            method: 'post',
                            url: '/api/subscribe/clear',
                            success: function () {
                                layer.msg('清空成功！')
                            },
                            complete: function () {
                                refresh()
                            }
                        })
                    })
                }
            })
        })
    }

    var $deleteSelector = proxy.getElementAll('.delete-selector')
    if ($deleteSelector.length > 0) {
        $deleteSelector.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                var ids = []

                var type = $el.dataset.type
                proxy.getElementAll(`.${type}`).forEach($item => {
                    var checkbox = $item.querySelector('input.checkbox')
                    if (checkbox.checked) {
                        ids.push($item.querySelector(`.${type}-id`).value)
                    }
                })

                if (ids.length > 0) {
                    layer.confirm('', {
                        title: '删除',
                        content: `是否删除这${ids.length}项？`,
                        btn: ['确认', '取消']
                    }, function () {
                        proxy.request({
                            method: 'post',
                            url: '/api/delete',
                            data: {
                                ids: ids.join(','),
                                className: type,
                            },
                            success: function (res) {
                                layer.msg('成功')
                                refresh()
                            }
                        })
                    })
                }
            })
        })
    }

    var $importSubscribe = proxy.getElementAll('.import-subscribe')
    if ($importSubscribe.length > 0) {
        $importSubscribe.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                layer.prompt({
                    title: '填写订阅地址',
                    formType: 2
                }, function (url, index) {
                    layer.close(index)
                    layer.prompt({
                        title: '填写备注，并确认',
                    }, function (remarks, index) {
                        layer.close(index)
                        layer.msg('订阅地址：' + url + '<br>备注：' + remarks)
                        setTimeout(function () {
                            proxy.request({
                                method: 'post',
                                url: '/api/subscribe/import',
                                data: {
                                    remarks,
                                    url,
                                },
                                success: function (res) {
                                    refresh()
                                }
                            })
                        }, 2000)
                    })
                })
            })
        })
    }

    var $updateSubscribe = proxy.getElementAll('.update-subscribe')
    if ($updateSubscribe.length > 0) {
        $updateSubscribe.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                $el.classList.add('is-loading')
                proxy.request({
                    method: 'post',
                    url: '/api/subscribe/update',
                    success: function (res) {
                        console.log('res=', res)
                    },
                    complete: function () {
                        $el.classList.remove('is-loading')
                        refresh()
                    }
                })
            })
        })
    }


    var $find = proxy.getElementAll('.find')
    if ($find.length > 0) {
        $find.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                layer.msg('暂时不支持该功能')
                return;
                var search = $el.parentElement.previousElementSibling.querySelector('.input').value
                var type = $el.dataset.type
                proxy.request({
                    method: 'post',
                    url: '/api/find',
                    data: {
                        search: search.trim(),
                        className: type,
                    },
                    success: function (res) {
                        console.log('res:', res)
                    }
                })
            })
        })
    }

    function reListener() {
        var $isEnableSwitch = proxy.getElementAll('.is-enable .switch .round')
        if ($isEnableSwitch.length > 0) {
            $isEnableSwitch.forEach(function ($el) {
                $el.addEventListener('click', function (event) {
                    var className = this.dataset.type
                    var root = this.parentElement.parentElement.parentElement
                    var id = root.querySelector(`.${className}-id`).value
                    var isEnable = !this.previousElementSibling.checked ? 1 : 0

                    if (!!parseInt(this.dataset.lock)) {
                        return;
                    }
                    this.dataset.lock = 1

                    proxy.request({
                        method: 'post',
                        url: `/api/${id}/update`,
                        data: {
                            isEnable,
                            className,
                        },
                        success: res => {
                            res = JSON.parse(res)
                            let content = isEnable ? '使用中' : '已禁用'

                            if (res.state != 0) {
                                console.log('没修改成功，还原', !this.previousElementSibling.checked)
                                this.previousElementSibling.checked = !this.previousElementSibling.checked
                                content = '没修改成功，还原'
                            }

                            content = template.enable.replace('<%CONTENT%>', content)

                            openLayer({
                                shade: 0,
                                maxmin: true,
                                content,
                            })
                        },
                        complete: () => {
                            console.log('isEnable=', isEnable)
                            this.previousElementSibling.checked = isEnable ? true : false
                            this.dataset.lock = 0
                        }
                    })
                })
            })
        }

        var $choose = proxy.getElementAll('.choose')
        if ($choose.length > 0) {
            $choose.forEach(function ($el) {
                $el.checked = false
            })
        }
    }
    reListener()

    function refresh(className) {
        let loading = layer.msg('加载中', {
            icon: 16,
            shade: 0.01,
            time: 18500,
        })

        proxy.request({
            method: 'get',
            url: '/api/refresh',
            data: {
                className,
            },
            success: function (res) {
                layer.close(loading)
                let result = JSON.parse(res)
                let accounts = result.data.accounts
                $('.account').remove()
                accounts.forEach(a => {
                    let account = template.accounts
                        .replace('<%ID%>', a.id)
                        .replace('<%REMARKS%>', a.remarks)
                        .replace('<%SERVICE_TYPE%>', a.serviceType)
                        .replace('<%HOST%>', a.host)
                        .replace('<%PORT%>', a.port)
                        .replace('<%METHOD%>', a.method)
                        .replace('<%PROTOCOL%>', a.protocol)
                    $('.accounts tbody').append(account)
                })

                let subscribes = result.data.subscribes
                $('.subscribe').remove()
                subscribes.forEach(s => {
                    let subscribe = template.subscribes
                        .replace('<%ID%>', s.id)
                        .replace('<%REMARKS%>', s.remarks)
                        .replace('<%URL%>', s.url)
                        .replace('<%IS_ENABLE%>', s.isEnable ? 'checked' : '')
                    $('.subscribes tbody').append(subscribe)
                })

                let links = result.data.links
                $('.link').remove()
                links.forEach(l => {
                    let ids = l.sourceID.map(id => {
                        return `<span class='id'>${id}</span>`
                    })
                    let urls = l.sourceURL.map(url => {
                        return `<a class='url' href='javascript:;'>${url}</a>`
                    })

                    let link = template.links
                        .replace('<%ID%>', l.id)
                        .replace('<%LINK_ID%>', l.linkId)
                        .replace('<%SOURCE_ID%>', ids.join(''))
                        .replace('<%SOURCE_URL%>', urls.join(''))
                        .replace('<%IS_ENABLE%>', l.isEnable ? 'checked' : '')
                    $('.links tbody').append(link)
                })
            },
            complete: function () {
                reListener()
            }
        })
    }

    function openLayer(opts) {
        opts = opts || {}
        opts.type = opts.type || 1
        opts.title = opts.title || '信息'
        opts.offset = opts.offset || '120px'
        opts.width = opts.width || 308
        opts.heigth = opts.heigth || 180
        opts.shade = opts.shade || 0.3
        opts.shadeClose = opts.shadeClose || false
        opts.maxmin = opts.maxmin || false
        opts.content = opts.content || ''

        layer.open({
            type: opts.type,
            // skin: 'layui-layer-rim',
            title: opts.title,
            offset: opts.offset,
            area: [`${opts.width}px`, `${opts.heigth}px`],
            shade: opts.shade,
            shadeClose: opts.shadeClose,
            maxmin: opts.maxmin,
            content: opts.content,
        })
    }

    var template = {}
    proxy.request({
        method: 'get',
        url: '/template.json',
        success: function (res) {
            template = JSON.parse(res)
        },
    })
})