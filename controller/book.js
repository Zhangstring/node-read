const SearchService = require('../services/book');
const search = async ctx => {
	console.log('开始');
	let bookName = ctx.query.name;
	if (bookName) {
		ctx.body = await SearchService.search(bookName);
	} else {
		console.log('请输入📚');
		ctx.body = '请输入📚';
	}
};
module.exports = {
	search
};
