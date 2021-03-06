'use strict';

var express = require('express');
var timeout = require('connect-timeout');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var AV = require('leanengine');
import {
  response,
} from './utils/util'

// 加载云函数定义，你可以将云函数拆分到多个文件方便管理，但需要在主文件中加载它们
require('./cloud');

var app = express();

// 设置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 设置默认超时时间
app.use(timeout('30s'));

// 加载云引擎中间件
app.use(AV.express());

app.enable('trust proxy');
if (app.get('env') === 'production') {
  // 需要重定向到 HTTPS 可去除下一行的注释。
  // app.use(AV.Cloud.HttpsRedirect());
}

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use(AV.Cloud.CookieSession({
  secret: 'proxy',
  maxAge: 3600000,
  fetchUser: true
}));

app.use(require('./middleware/auth'))

app.get('/', function (req, res) {
  return res.render('index')
})
app.use('/login', require('./routes/login'))
app.use('/account', require('./routes/account'))
app.use('/link', require('./routes/link'))
app.use('/api', require('./routes/api'))

app.use(function (req, res, next) {
  // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
  if (!res.headersSent) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
})
app.use(function (err, req, res, next) {
  if (req.timedout && req.headers.upgrade === 'websocket') {
    // 忽略 websocket 的超时
    return;
  }

  var statusCode = err.status || 500;
  if (statusCode === 500) {
    console.error(err.stack || err);
  }
  if (req.timedout) {
    console.error('请求超时: url=%s, timeout=%d, 请确认方法执行耗时很长，或没有正确的 response 回调。', req.originalUrl, err.timeout);
  }
  res.status(statusCode);
  // 默认不输出异常详情
  var error = {};
  if (app.get('env') === 'development') {
    // 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
    error = err;
  }

  return res.json(response(`error: ${err.message}`, statusCode))
  // res.render('error', {
  //   message: err.message,
  //   error: error
  // });
})

module.exports = app;