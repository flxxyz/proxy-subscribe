const clone = (data) => {
    if (Array.isArray(data)) {
        let arr = []
        data.forEach((value, index) => arr[index] = clone(value))
        return arr
    } else if (data instanceof Object) {
        let obj = {}
        for (let key in data) {
            obj[key] = clone(data[key])
        }
        return obj

    } else {
        return data
    }

}

const pagination = () => {

}

const execute = (promise) => {
    return promise.then(data => [null, data])
        .catch(err => [err, null])
}

const Type = (function (Type) {
    Type = function () {
        this.types.forEach(type => {
            this[`is${type}`] = (p) => Object.prototype.toString.call(p).slice(8, -1) === type
        })
    }
    Type.prototype = {
        types: ['Object', 'Array', 'String', 'Number', 'Boolean', 'Function', 'RegExp', 'Date', 'Undefined', 'Null', 'Symbol', 'Blob', 'ArrayBuffer'],
    }
    return new Type()
})()

module.exports = {
    clone,
    pagination,
    execute,
    Type,
}