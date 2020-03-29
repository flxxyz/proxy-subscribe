var Generate = function () {
    this.ssr = {
        Text: '服务器地址：[host]\n服务器端口：[port]\n加密方式：[encrypt]\n密码：[password]\n协议：[protocol]\n协议参数：[protocolParam]\n混淆：[obfs]\n混淆参数：[obfsParam]',
        Json: {
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

    this.template = {
        vmess: '',
        ss: '',
        ssr: '',
        socks: '',
    }
}
Generate.prototype.vmess = function (data) {}
Generate.prototype.socks = function (data) {}
Generate.prototype.ss = function (data) {}
Generate.prototype.ssr = function (data) {
    console.log(data)
    var text = this.ssr.Text.replace('[host]', data.host)
        .replace('[port]', data.port)
        .replace('[encrypt]', data.ssrSetting.encrypt)
        .replace('[password]', data.ssrSetting.password)
        .replace('[protocol]', data.ssrSetting.protocol)
        .replace('[protocolParam]', data.ssrSetting.protocolParam)
        .replace('[obfs]', data.ssrSetting.obfs)
        .replace('[obfsParam]', data.ssrSetting.obfsParam)

    var json = Object.assign({}, this.ssr.Json)
    json.server = data.host
    json.server_port = data.port
    json.password = data.ssrSetting.password
    json.method = data.ssrSetting.encrypt
    json.protocol = data.ssrSetting.protocol
    json.protocol_param = data.ssrSetting.protocolParam
    json.obfs = data.ssrSetting.obfs
    json.obfs_param = data.ssrSetting.obfsParam

    var card = getElement('.modal-card-body .ssr')
    card.querySelector('.conf-text').innerHTML = text
    card.querySelector('.conf-json').innerHTML = JSON.stringify(json, null, 2)
}
Generate.prototype.ssrQr = function () {

}
Generate.prototype.compose = function (type, data, salt = '') {
    return `${type}://${this.base64(data)}${salt}`
}
Generate.prototype.base64 = function (data) {
    return Base64.encode(data)
}