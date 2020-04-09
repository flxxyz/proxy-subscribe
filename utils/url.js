class QueryString {
    constructor() {
        this.source = {}
    }
    reset() {
        Object.keys(this.source).forEach(k => delete this[k])
        this.source = {}
    }
    encode(obj) {
        this.reset()
        Object.keys(obj).forEach(k => this.set(k, obj[k]))
        return this
    }
    decode(str) {
        this.reset()
        let params = str.split('&')
        params.filter(v => v !== '')
            .forEach(param => {
                let [key, value] = param.split('=')
                this.set(key, value)
            })
        return this
    }
    get(key) {
        return this[key]
    }
    set(key, value) {
        return this.source[key] = this[key] = value
    }
    all() {
        return this.source
    }
    toString() {
        let t = []
        Object.keys(this).forEach(k => t.push(`${k}=${this[k]}`))
        return t.join('&')
    }
}

const qs = new QueryString()

export {
    qs,
}