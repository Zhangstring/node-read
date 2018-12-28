const mysql = require('mysql');
const config = require('./config');
const moment = require('moment');
var connection = mysql.createConnection({
	host: config.database.HOST,
	user: config.database.USER,
	password: config.database.PASSWORD,
	port: config.database.PORT,
	database: config.database.DATABASE
});

let query = function(sql) {
	return new Promise((resolve, reject) => {
		connection.query(sql, (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});
};
// 添加书籍
let setBook = function(name) {
	let nowTime = moment().format('YYYY-MM-DD HH:mm:ss');
	console.log(nowTime);
	console.log(name);
	let _sql = `INSERT INTO tb_book (book_name, create_time) VALUES ('${name}', '${nowTime}');`;
	return query(_sql);
};
// 添加章节
let setContent = function(id, title, content, downTime) {
	let nowTime = moment().format('YYYY-MM-DD HH:mm:ss');
	let _sql = `INSERT INTO tb_book_content (book_id,title,content, create_time,down_time) VALUES ('${id}', '${title}', '${content}','${nowTime}','${downTime
		? downTime
		: 0}');`;
	return query(_sql);
};
//  查询书籍
let findBook = function(name) {
	let _sql = `SELECT * FROM tb_book WHERE book_name = '${name}'`;
	return query(_sql);
};
module.exports = {
	setBook,
	setContent,
	findBook
};
