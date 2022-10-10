import type {Page, PageList} from '@types';
import {log} from './logger.js';
import urlFinder from 'html-urls';

export default class Scraper {
	public constructor(private readonly pageList: PageList, private readonly hostname: string) {
	}

	public async checkPage(page: Page) {
		const url = page.url.href;
		log(`Fetching ${url}`, 1);
		const response = await fetch(url);
		page.code = response.status;
		page.visited = new Date();
		page.mimeType = response.headers.get('Content-Type') ?? 'unknown';
		if (!page.mimeType?.includes('text/html')) {
			return page.mimeType;
		}

		const html = await response.text();
		page.content = html;
		log('Finding URLS', 1);
		const links = urlFinder({html, url});
		for (const link of links) {
			this.processLink(link, url);
		}

		return true;
	}

	private processLink(link: {value: string; url: string | undefined; uri: string | undefined}, searchedURL: string) {
		if (!link.url || this.pageList.has(link.url)) {
			return;
		}

		const url = new URL(link.url);
		if (url.host !== this.hostname) {
			return;
		}

		const newItem: Page = {
			url: new URL(link.url),
			foundOn: searchedURL,
		};
		this.pageList.set(link.url, newItem);
	}
}

