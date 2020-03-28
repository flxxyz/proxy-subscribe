const ignoreUrl = ['/', '/login', '/link', '/link/.*']

module.exports = function (req, res, next) {
  if (!new RegExp(`^(${ignoreUrl.join('|')})$`).test(req.url)) {
    if (typeof req.currentUser === 'undefined') {
      res.redirect('/')
    }
  }

  next()
}