import type {Page, PageList, ScraperOptions} from '@types';
import {log} from './logger.js';
import urlFinder from 'html-urls';

const allowedTypes = ['html', 'htm', 'xhtml', 'asp', 'aspx', 'shtml', 'dhtml', 'php', 'php5', 'jsp'];
export default class Scraper {
	public constructor(private readonly pageList: PageList, private readonly hostname: string, private readonly options: ScraperOptions) {
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

		const html = this.getRelevantHTML(await response.text());
		page.content = html;
		log('Finding URLS', 1);
		const links = urlFinder({html, url});
		for (const link of links) {
			this.processLink(link, url);
		}

		return true;
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	private getRelevantHTML(s: string): string {
		if (!this.options.ignoreHead) {
			return s;
		}

		const bodyMatch = s.match(/<body.+/igs);
		return bodyMatch?.at(0)?.replace('</html>', '') ?? '';
	}

	private processLink(link: {value: string; url: string | undefined; uri: string | undefined}, searchedURL: string) {
		if (!link.url || this.pageList.has(link.url) || this.shouldIgnore(link.url)) {
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

	private shouldIgnore(url: string): boolean {
		if (!this.options.htmlOnly) {
			return false;
		}

		const urlObj = new URL(url);
		const {pathname} = urlObj;
		const splitPath = pathname.split('.');
		const extension = splitPath.at(-1);
		return Boolean(splitPath.length > 1 && !allowedTypes.includes(extension!));
	}
}

