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

    var $chooses = proxy.getElementAll('.choose .checkbox input')
    var $chooseItems = proxy.getElementAll('.choose-item')
    if ($chooses.length > 0) {
        $chooses.forEach(($el) => {
            $el.addEventListener('click', function (event) {
                $chooseItems.forEach($item => {
                    if ($item.dataset.type === $el.classList[0]) {
                        var checkbox = $item.querySelector('input.checkbox')
                        checkbox.checked = !checkbox.checked
                    }
                })

            })
        })
    }

    var $generate = proxy.getElementAll('.generate')
    if ($generate.length > 0) {
        $generate.forEach($el => {
            $el.addEventListener('click', function (event) {
                var ids = []

                $chooseItems.forEach($item => {
                    var checkbox = $item.querySelector('input.checkbox')
                    if (checkbox.checked) {
                        ids.push($item.querySelector('.link-id').value)
                    }
                })

                if (ids.length > 0) {
                    proxy.request({
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

    var $deleteServer = proxy.getElementAll('.delete-server')
    if ($deleteServer.length > 0) {
        $deleteServer.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                var ids = []

                $chooseItems.forEach($item => {
                    var checkbox = $item.querySelector('input.checkbox')
                    if (checkbox.checked) {
                        ids.push($item.querySelector('.link-id').value)
                    }
                })

                if (ids.length > 0) {
                    proxy.request({
                        method: 'post',
                        url: '/api/delete',
                        dataType: 'json',
                        data: {
                            ids: ids.join(','),
                            className: this.classList.item(2),
                        },
                        success: function (res) {
                            console.log('res:', res)
                        }
                    })
                }
            })
        })
    }

    var $importSubscribe = proxy.getElementAll('.import-subscribe')
    if ($importSubscribe.length > 0) {
        $importSubscribe.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                proxy.request({
                    method: 'post',
                    url: '/api/import',
                    dataType: 'json',
                    data: {
                        url: '',
                    },
                    success: function (res) {
                        console.log('res:', res.data.content)
                        window.content = res.data.content
                    }
                })
            })
        })
    }

    var $isDisableSwitch = proxy.getElementAll('.is-disable .switch .round')
    if ($isDisableSwitch.length > 0) {
        $isDisableSwitch.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                var root = this.parentElement.parentElement.parentElement
                var linkId = root.querySelector('.link-id').value
                var isDisabled = !this.previousElementSibling.checked ? 1 : 0
                proxy.request({
                    method: 'post',
                    url: `/api/${linkId}/update`,
                    data: {
                        isDisabled
                    },
                    success: res => {
                        res = JSON.parse(res)
                        let content = !isDisabled ? '已禁用' : '使用中'

                        if (res.state != 0) {
                            console.log('没修改成功，还原', !this.previousElementSibling.checked)
                            this.previousElementSibling.checked = !this.previousElementSibling.checked
                            content = '没修改成功，还原'
                        }

                        // layer.open({
                        //     type: 1,
                        //     area: ['500px', '300px'],
                        //     title: '你好，layer。',
                        //     shade: 0,
                        //     maxmin: true,
                        //     content: content
                        // })
                        openLayer({
                            shade: 0,
                            maxmin: true,
                            content: content,
                        })
                    }
                })

            })
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
})