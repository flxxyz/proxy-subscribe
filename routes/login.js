var router = require('express').Router()
var AV = require('leanengine')

router.post('/', function (req, res, next) {
    AV.User.logIn(req.body.user, req.body.pass).then(function (user) {
        res.saveCurrentUser(user) // 保存当前用户到 Cookie
        res.redirect('/account') // 跳转到个人资料页面
    }, function (err) {
        res.redirect('/')
    })
})

module.exports = router