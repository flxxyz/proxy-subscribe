import {
    compose
} from './util'

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

const serializeSs = (template, value) => {
    return compose(value.get('serviceType'), JSON.stringify(template))
}

const deserializeVmess = (type, data, qs) => {
    let isV2ray = true
    try {
        data = JSON.parse(data)
    } catch (err) {
        isV2ray = false
    }

    let template = {
        host: '',
        port: '',
        remarks: '',
        serviceType: type,
        vmessSetting: {}
    }

    if (isV2ray) {
        template.remarks = data.ps
        template.host = data.add
        template.port = data.port
        template.vmessSetting.userId = data.id
        template.vmessSetting.alterId = data.aid
        template.vmessSetting.protocol = data.net
        template.vmessSetting.type = data.type
        template.vmessSetting.host = data.host
        template.vmessSetting.path = data.path
        template.vmessSetting.tls = data.tls
    } else {
        let newData = []
        data = data.split('@')
        data.forEach(v => newData.push.apply(newData, v.split(':')))
        template.host = newData[2]
        template.port = newData[3]
        template.vmessSetting.encrypt = newData[0] //加密方式
        template.vmessSetting.userId = newData[1] //用户id，没有额外id

        template.remarks = qs.remarks
        template.vmessSetting.path = qs.path
        template.vmessSetting.host = qs.obfsParam
        template.vmessSetting.type = ['http', 'h2', 'websocket', 'mkcp'].includes(qs.obfs) ? qs.obfs : 'none'
        qs.tls = qs.tls || ''
        if (qs.tls) {
            template.vmessSetting.tls = qs.tls
        }
        qs.mux = qs.mux || ''
        if (qs.mux) {
            template.vmessSetting.mux = qs.mux
        }
    }

    return template
}

const deserializeSsr = (value) => {
    // let [base, params] = decode(value).split('/?')
    // base = base.split(':')
    // template.host = base[0]
    // template.port = base[1]
    // template.protocol = base[2]
    // template.encrypt = base[3]
    // template.obfs = base[4]
    // template.password = decode(base[5])

    return ''
}

const deserializeSs = (value) => {
    return ''
}

module.exports = {
    deserializeVmess,
    deserializeSsr,
    deserializeSs,
    serializeVmess,
    serializeSsr,
    serializeSs,
}