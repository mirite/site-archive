import urlFinder from 'html-urls';
import puppeteer from 'puppeteer';
import {IPage, PageList} from "@types";
import {log, setLogLevel} from "./logger.js";

setLogLevel(1);
const pageList: PageList = new Map<string, IPage>();

const entryPointRaw = process.argv[2];
const entryPoint = new URL(entryPointRaw);
const seed: IPage = {
	url: entryPoint,
	foundOn: 'Entry Point',
}

pageList.set(entryPointRaw, seed);

function processLink(link: { value: string; url: string | undefined; uri: string | undefined }, searchedURL: string) {
	if (!link.url || pageList.has(link.url)) return;
	const url = new URL(link.url);
	if (url.host != entryPoint.host) return;
	const newItem: IPage = {
		url: new URL(link.url),
		foundOn: searchedURL,
	}
	pageList.set(link.url, newItem);
}

async function checkPage(page: IPage) {
	const url = page.url.href;
	log(`Fetching ${url}`, 1);
	const response = await fetch(url);
	const html = await response.text();
	page.code = response.status;
	page.visited = new Date();
	log(`Finding URLS`, 1)
	const links = urlFinder({html, url});
	for (const link of links) {
		processLink(link, url);
	}
}

const browser = await puppeteer.launch();
const puppeteerPage = await browser.newPage();

for (const [url, page] of pageList) {
	log(`Checking ${url}`, 2);
	await puppeteerPage.goto(url);
	await puppeteerPage.screenshot({path: encodeURIComponent(url) + '.png'});
	await checkPage(page);
}
await browser.close();
console.log(Array.from(pageList));
export {};
