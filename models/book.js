const puppeteer = require('puppeteer');
const fs = require('fs');
async function getBook(page, name) {
	let bqgSearch = 'https://sou.xanbhx.com/search?siteid=qula&q=';
	bqgSearch += name;
	await page.goto(bqgSearch);
	const result = await page.evaluate(() => {
		let bookName = document.querySelector('.search-list li:nth-of-type(2) .s2>a');
		return bookName.href;
	});
	return result;
}
async function getTiTle(page, url) {
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
	return result;
}
async function getText(page, url) {
	if (!url) {
		return;
	}
	console.log('准备打开章节页面');
	await page
		.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 })
		.then(() => {
			console.log('打开章节页面成功');
		})
		.catch(err => {
			console.log('打开章节页面失败', err);
		});
	console.log('准备获取章节内容');
	const result = await page
		.evaluate(() => {
			let data = document.querySelector('#content').innerHTML;
			return data;
		});
	return result;
}

async function init(name) {
	let startTime = +new Date();
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	let nameURL = await getBook(page, name);
	console.log('小说地址', nameURL);
	let title = await getTiTle(page, nameURL);
	console.log('获取目录成功');
	let data = [];
	for (let i = 0; i < title.length; i++) {
		let sectionStartTime = +new Date();
		let content = await getText(page, title[i].url);
		let downTime = (+new Date() - sectionStartTime) / 1000;
		console.log(title[i].title, i / title.length, '本章用时' + downTime + 's');
		data.push({
			title: title[i].title,
			content,
			downTime
		});
	}
	browser.close();
	let runTime = (+new Date() - startTime) / 1000;
	console.log('获取小说成功，共消耗' + runTime + 's');
	return data;
}
module.exports = {
	init
};
