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


module.exports = {
    clone,
    pagination,
    execute,
}