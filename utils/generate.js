var Base64 = require('js-base64').Base64

const generateVmess = (template, value) => {
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

const generateSsr = (template, value) => {
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

const generateSs = (template, value) => {
    return compose(value.get('serviceType'), JSON.stringify(template))
}

const generateSocks = (template, value) => {
    template.username = value.get('socksSetting').username
    template.password = value.get('socksSetting').password
    template.host = value.get('host')
    template.port = value.get('port')
    let data = `${template.username}:${template.password}@${template.host}:${template.port}`
    let remarks = value.get('remarks') ? `#${encodeURIComponent(value.get('remarks'))}` : ''
    return compose(value.get('serviceType'), data, remarks)
}

const compose = (type, data, salt = '') => {
    return `${type}://${encode(data)}${salt}`
}

const encode = (data) => {
    return Base64.encode(data)
}

const decode = (data) => {
    return Base64.decode(data)
}

module.exports = {
    generateVmess,
    generateSsr,
    generateSs,
    generateSocks,
    compose,
    encode,
    decode,
}