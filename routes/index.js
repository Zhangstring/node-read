const router = require('koa-router')();
const BookController = require('../controller/book');

router.get('/api/book/search', BookController.search);

module.exports = router;
