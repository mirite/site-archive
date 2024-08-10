import urlFinder from "html-urls";

import { log, logError } from "./logger.js";
import type {
	ConcreteOptions,
	Page,
	PageList,
	ScraperOptions,
} from "./types/index.js";

export default class Scraper {
	/**
	 * @param pageList
	 * @param hostname
	 * @param options
	 */
	public constructor(
		private readonly pageList: PageList,
		private readonly hostname: string,
		private readonly options: ConcreteOptions<ScraperOptions>,
	) {}

	/** @param page */
	public async checkPage(page: Page) {
		const url = page.url.href;
		try {
			log(`Fetching ${url}`, 1);
			const response = await fetch(url, {
				redirect: this.options.redirect,
			});
			page.code = response.status;
			page.visited = new Date();
			page.mimeType = response.headers.get("Content-Type") ?? "unknown";
			if (!page.mimeType?.includes("text/html")) {
				return page.mimeType;
			}

			const html = this.getRelevantHTML(await response.text());
			page.content = html;
			log("Finding URLS", 1);
			const links = urlFinder({ html, url });
			for (const link of links) {
				this.processLink(link, url);
			}

			return true;
		} catch (e: unknown) {
			logError(`processing ${url}`, e);
		}
	}

	/** @param s */
	private getRelevantHTML(s: string): string {
		if (!this.options.ignoreHead) {
			return s;
		}

		const bodyMatch = s.match(/<body.+/gis);
		return bodyMatch?.at(0)?.replace("</html>", "") ?? "";
	}

	/**
	 * @param link
	 * @param link.value
	 * @param link.url
	 * @param link.uri
	 * @param searchedURL
	 */
	private processLink(
		link: { value: string; url: string | undefined; uri: string | undefined },
		searchedURL: string,
	) {
		const { url: rawUrl } = link;
		if (!rawUrl || this.pageList.has(rawUrl) || this.shouldIgnore(rawUrl)) {
			return;
		}

		const url = new URL(rawUrl);

		if (url.host !== this.hostname) {
			return;
		}

		if (this.options.ignoreQueryString) {
			url.search = "";
		}

		if (this.options.ignoreAnchors) {
			url.hash = "";
		}

		const newItem: Page = {
			url,
			foundOn: searchedURL,
		};
		this.pageList.set(url.toString(), newItem);
	}

	/** @param url */
	private shouldIgnore(url: string): boolean {
		return this.isAllowedType(url);
	}

	/** @param url */
	private isAllowedType(url: string) {
		if (!this.options.htmlOnly) {
			return false;
		}

		const urlObj = new URL(url);
		const { pathname } = urlObj;
		const splitPath = pathname.split(".");
		const extension = splitPath.at(-1);
		return Boolean(
			splitPath.length > 1 && !this.options.htmlTypes.includes(extension || ""),
		);
	}
}
