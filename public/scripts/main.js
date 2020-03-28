function getSingle(selector) {
    return document.querySelector(selector)
}

function getAll(selector) {
    return document.querySelectorAll(selector)
}

document.addEventListener('DOMContentLoaded', function () {
    var Generate = function () {}
    Generate.prototype.vmess = function (data) {
        getSingle('.modal-card-title').innerHTML = 'VMESS'
    }
    Generate.prototype.ss = function (data) {
        getSingle('.modal-card-title').innerHTML = 'SS'
    }
    Generate.prototype.ssr = function (data) {
        console.log(data)
        getSingle('.modal-card-title').innerHTML = 'SSR'
        var text = template.ssrText.replace('[host]', data.host)
            .replace('[port]', data.port)
            .replace('[encrypt]', data.ssrSetting.encrypt)
            .replace('[password]', data.ssrSetting.password)
            .replace('[protocol]', data.ssrSetting.protocol)
            .replace('[protocolParam]', data.ssrSetting.protocolParam)
            .replace('[obfs]', data.ssrSetting.obfs)
            .replace('[obfsParam]', data.ssrSetting.obfsParam)

        var json = Object.assign({}, template.ssrJson)
        json.server = data.host
        json.server_port = data.port
        json.password = data.ssrSetting.password
        json.method = data.ssrSetting.encrypt
        json.protocol = data.ssrSetting.protocol
        json.protocol_param = data.ssrSetting.protocolParam
        json.obfs = data.ssrSetting.obfs
        json.obfs_param = data.ssrSetting.obfsParam

        var card = getSingle('.modal-card-body .ssr')
        card.querySelector('.conf-text').innerHTML = text
        card.querySelector('.conf-json').innerHTML = JSON.stringify(json, null, 2)
    }
    Generate.prototype.socks = function (data) {
        getSingle('.modal-card-title').innerHTML = 'SOCKS'
    }
    Generate.prototype.ssrQr = function () {

    }
    var generate = new Generate()

    var template = {
        ssrText: '服务器地址：[host]\n服务器端口：[port]\n加密方式：[encrypt]\n密码：[password]\n协议：[protocol]\n协议参数：[protocolParam]\n混淆：[obfs]\n混淆参数：[obfsParam]',
        ssrJson: {
            server: '',
            server_port: 80,
            local_address: '127.0.0.1',
            local_port: 1080,
            timeout: 300,
            password: '',
            method: '',
            obfs: '',
            obfs_param: '',
            protocol: '',
            protocol_param: '',
        }
    }

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

    var $accounts = getAll('.account')
    if ($accounts.length > 0) {
        $accounts.forEach(($el) => {
            $el.addEventListener('click', function (event) {
                var data = JSON.parse(this.querySelector('.source').dataset.data)
                console.log(data)
                generate[data.serviceType](data)
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

    var $subscribe = getAll('.subscribe')
    if ($subscribe.length > 0) {
        $subscribe.forEach(($el) => {
            $el.addEventListener('click', function (event) {
                var data = JSON.parse(this.querySelector('.source').dataset.data)
                console.log(`${window.location.origin}/link/${data.linkId}`)
                // generate[data.serviceType](data)
                // $modalCardContents.forEach(function ($el) {
                    // $el.classList.remove('is-hidden')
                    // if (!$el.classList.contains(data.serviceType)) {
                        // $el.classList.add('is-hidden')
                    // }
                // })
                // $modal.classList.toggle('is-active')
            })
        })
    }

    var $modal = getSingle('.modal')
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