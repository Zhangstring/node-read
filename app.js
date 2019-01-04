const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const app = new Koa();
const router = require('./routes/index')
const moment = require('moment');
app.use(bodyParser())
app.use(router.routes());
app.listen(3000)
console.log('server start'+ moment().format('YYYY-MM-DD HH:mm:ss'))
