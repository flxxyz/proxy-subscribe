import {
    clone,
    compose,
    decode,
    requestOrigin,
} from './util'

let AccountTemplate = {
    host: '',
    port: '',
    remarks: '',
    serviceType: '',
    method: 'auto',
    protocol: '',
    setting: {},
}

const serializeVmess = (template, value) => {
    template.ps = value.get('remarks')
    template.add = value.get('host')
    template.port = value.get('port')
    template.id = value.get('vmessSetting').userId
    template.aid = value.get('vmessSetting').alterId
    template.net = value.get('vmessSetting').protocol
    template.type = value.get('vmessSetting').type
    template.host = value.get('vmessSetting').host
    template.path = value.get('vmessSetting').path
    template.tls = value.get('vmessSetting').tls

    return compose(value.get('serviceType'), JSON.stringify(template))
}

const serializeSsr = (template, value) => {
    template.remarks = value.get('remarks')
    template.host = value.get('host')
    template.port = value.get('port')
    template.password = value.get('ssrSetting').password
    template.encrypt = value.get('ssrSetting').encrypt
    template.protocol = value.get('ssrSetting').protocol
    template.protocolParam = value.get('ssrSetting').protocolParam
    template.obfs = value.get('ssrSetting').obfs
    template.obfsParam = value.get('ssrSetting').obfsParam
    let data = '[host]:[port]:[protocol]:[encrypt]:[obfs]:[password]/?obfsparam=[obfsParam]&protoparam=[protocolParam]&remarks=[remarks]'
        .replace('[host]', template.host)
        .replace('[port]', template.port)
        .replace('[protocol]', template.protocol)
        .replace('[encrypt]', template.encrypt)
        .replace('[obfs]', template.obfs)
        .replace('[password]', Base64.encode(template.password))
        .replace('[obfsParam]', template.obfsParam)
        .replace('[protocolParam]', template.protocolParam)
        .replace('[remarks]', Base64.encode(template.remarks))
    return compose(value.get('serviceType'), data)
}

const deserializeVmess = (data, qs) => {
    let isShadowrocket = true
    try {
        data = JSON.parse(data)
    } catch (err) {
        isShadowrocket = false
    }

    let template = clone(AccountTemplate)
    template.serviceType = 'vmess'
    template.setting = {
        isShadowrocket,
        content: data,
        queryString: qs.all()
    }

    if (!isShadowrocket) {
        let newData = []
        data = data.split('@')
        data.forEach(v => newData.push.apply(newData, v.split(':')))
        template.host = newData[2]
        template.port = newData[3]
        template.remarks = qs.remarks
        template.method = newData[0]
        template.protocol = ['http', 'h2', 'websocket', 'mkcp'].includes(qs.obfs) ? qs.obfs : 'none'
        // template.vmessSetting.method = newData[0]
        // template.vmessSetting.password = newData[1]
        // template.vmessSetting.host = newData[2]
        // template.vmessSetting.port = newData[3]
        // template.vmessSetting.remarks = qs.remarks || ''
        // template.vmessSetting.obfs = ['http', 'h2', 'websocket', 'mkcp'].includes(qs.obfs) ? qs.obfs : 'none'
        // template.vmessSetting.obfsParam = qs.obfsParam || ''
        // template.vmessSetting.path = qs.path || ''
        // template.vmessSetting.tls = qs.tls || ''
    } else {
        template.remarks = data.ps
        template.host = data.add
        template.port = data.port
        template.protocol = data.net
        // template.vmessSetting = Object.assign(template.vmessSetting, data)
    }

    return template
}

const deserializeSsr = (data, qs) => {
    let template = clone(AccountTemplate)
    template.serviceType = 'ssr'

    let [base, params] = data.split('/?')
    base = base.split(':')
    params = qs.decode(params)
    template.host = base[0]
    template.port = base[1]
    template.ssrSetting.proto = base[2]
    template.ssrSetting.method = base[3]
    template.ssrSetting.obfs = base[4]
    template.ssrSetting.password = decode(base[5])
    template.ssrSetting.obfsparam = decode(params.obfsparam)
    template.ssrSetting.protoparam = decode(params.protoparam)
    template.ssrSetting.remarks = decode(params.remarks)
    template.remarks = template.ssrSetting.remarks
    template.ssrSetting.group = decode(params.group)

    return template
}

const updateSubscribe = (urls, arr = []) => {
    urls.forEach(url => arr.push(requestOrigin({
        url,
        T: 15000,
    })))
    return Promise.all(arr)
}

module.exports = {
    deserializeVmess,
    deserializeSsr,
    serializeVmess,
    serializeSsr,
    updateSubscribe,
}