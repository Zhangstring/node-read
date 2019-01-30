const mysql = require('../lib/mysql');
const puppeteer = require('puppeteer');
const fs = require('fs');

async function getBook(browser, name) {
	const page = await browser.newPage();
	let bqgSearch = 'https://sou.xanbhx.com/search?siteid=qula&q=';
	bqgSearch += name;
	await page.goto(bqgSearch);
	const result = await page.evaluate(() => {
		let bookName = document.querySelector('.search-list li:nth-of-type(2) .s2>a');

		return bookName.href;
	});
	await page.close();
	return result;
}
async function getTiTle(browser, url) {
	try {
		const page = await browser.newPage();
		await page.goto(url);
		const result = await page.evaluate(() => {
			let titleElement = document.querySelectorAll('dd>a');
			let data = [];
			titleElement.forEach(item => {
				let title = item.innerText;
				let url = item.href;
				data.push({
					title,
					url
				});
			});
			return data;
		});
		await page.close();
		return result;
	} catch (e) {
		console.log('getTiTle', e);
	}
}
async function getText(browser, title) {
	try {
		let sectionStartTime = +new Date();
		const page = await browser.newPage();
		if (!title.url) {
			return;
		}
		console.log('准备打开章节页面');
		page.on('error', err => {
			console.log('error: ', err);
		});
		let content = await page
			.goto(title.url, { waitUntil: 'domcontentloaded', timeout: 120000 })
			.then(() => {
				console.log('打开章节页面成功');
				return page.evaluate(() => {
					let data = document.querySelector('#content').innerHTML;
					return data;
				});
			})
			.catch(err => {
				console.log('打开章节页面失败', err);
				return '';
			});
		await page.close();
		let downTime = (+new Date() - sectionStartTime) / 1000;
		console.log(title.title, '本章用时' + downTime + 's');
		return {
			title: title.title,
			content,
			downTime,
			url: title.url
		};
	} catch (error) {
		console.log('getText', error);
	}
}
async function init(name) {
	let startTime = +new Date();
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	let nameURL = await getBook(browser, name);
	console.log('小说地址', nameURL);
	let title = await getTiTle(browser, nameURL);
	console.log('获取目录成功');
	let data = [];
	for (let i = 0; i < title.length; i = i + 5) {
		// let content = await getText(browser, title[i].url);

		let titleArry = title.slice(i, i + 5);
		let urlArry = [];
		titleArry.forEach(item => {
			urlArry.push(getText(browser, item));
		});
		await Promise.all(urlArry).then(data => {
			data.push(data);
		});
	}
	browser.close();
	let runTime = (+new Date() - startTime) / 1000;
	await console.log('获取小说成功，共消耗' + runTime + 's');
	return data;
}

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
	let value = await init(name).then(value => {
		return value;
	});
	// 将书章节存入数据库
	for (let i = 0; i < value.length; i++) {
		let section = value[i];
		section.id = insertId;
		await mysql
			.setContent(section)
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
/**
 * 查询是否存在书籍，若存在返回书籍名称，若不存在去下载书籍
 * @param {string} bookName 书记名称
 * @return {Object} 返回状态
 */
const search = async bookName => {
	let result = '';
	let bookInfo = await findBook(bookName).then(res => {
		return res;
	});
	if (bookInfo.length) {
		result = bookInfo[0];
		if (result.down_status === 0) {
			console.log('正在下载书籍', result);
		} else {
			console.log('存在书籍', result);
		}
	} else {
		console.log('开始下载');
		addBook(bookName).then(() => {
			console.log('search success');
		});
		result = '开始下载';
	}
	return {
		code: '0',
		msg: 'success',
		result
	};
};

module.exports = {
	search
};
