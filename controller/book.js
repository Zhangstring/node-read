const mysql = require('../lib/mysql');
const searchBook = require('../models/book');
const addBook = async name => {
	// 将书名存入数据库中，返回id
	let insertId = await mysql
		.setBook(name)
		.then(res => {
			console.log('书名写入数据库', res.insertId);
			return res.insertId;
		})
		.catch(err => {
			console.log('setBook', err);
		});
	// 获取书的内容
	let value = await searchBook.init(name).then(value => {
		return value;
	});
	// 将书章节存入数据库
	for (let i = 0; i < value.length; i++) {
		let section = value[i];
		await mysql
			.setContent(insertId, section.title, section.content, section.downTime)
			.then(res => {
				console.log('success', res);
			})
			.catch(err => {
				console.log('setContent', err);
			});
	}
	await mysql
		.downSuccessBook(insertId)
		.then(res => {
			console.log('book success', res);
		})
		.catch(err => {
			console.log('updateBookStatus', err);
		});
	return;
};
// 查询数据库中是否存在该书籍
const findBook = async name => {
	let bookName = await mysql
		.findBook(name)
		.then(res => {
			return res;
		})
		.catch(err => {
			console.log('findBook', err);
		});
	return bookName;
};
module.exports = {
	addBook,
	findBook
};
