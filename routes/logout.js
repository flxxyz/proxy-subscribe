var router = require('express').Router()
var AV = require('leanengine')

router.get('/', function (req, res, next) {
  if (typeof req.currentUser !== 'undefined') {
    req.currentUser.logOut()
    res.clearCurrentUser()
  }
  res.redirect('/')
});

module.exports = router