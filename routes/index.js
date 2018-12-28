const router = require('koa-router')();
const book = require('../controller/book');

router.get('/api/book/search', async (ctx, next) => {
	console.log('开始');
	let result = '';
	let bookName = ctx.query.name;
	if (bookName) {
		let bookInfo = await book.findBook(bookName).then(res => {
			return res;
		});
		if (bookInfo.length) {
			result = bookInfo[0];
			console.log('存在书籍');
		} else {
			console.log('开始下载');
			book.addBook(bookName).then(() => {
				console.log('search success');
			});
			result = '开始下载';
		}

		ctx.body = {
			code: '0',
			msg: 'success',
			result
		};
	} else {
		console.log('请输入📚');
		ctx.body = '请输入📚';
	}
});

module.exports = router;
