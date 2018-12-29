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
}
async function getText(browser, url) {
	const page = await browser.newPage();
	if (!url) {
		return;
	}
	console.log('准备打开章节页面');
	page.on('error', err => {
		console.log('error: ', err);
	});
	let content = await page
		.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 })
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
	return content;
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
	for (let i = 0; i < title.length; i++) {
		let sectionStartTime = +new Date();
		let content = await getText(browser, title[i].url);

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
	await console.log('获取小说成功，共消耗' + runTime + 's');
	return data;
}
module.exports = {
	init
};
