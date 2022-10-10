import {IPage, PageList} from "@types";
import Scraper from "./Scraper.js";
import Path from "path";
import {bundle, createDir, sanitizeFileName} from "./helpers/files.js";
import ScreenShots from "./ScreenShots.js";
import {log, setLogFunction, setLogLevel} from "./logger.js";
import fs from "fs";

export default class Crawler {
	private readonly pageList: PageList;
	private readonly entryPoint: URL;
	private readonly captureDir: string;

	public constructor(rawEntryPoint: string, captureDir: string, logLevel: 1 | 2 | 3 = 1, onEvent: (msg: string) => unknown = console.log) {
		this.pageList = new Map<string, IPage>();
		this.entryPoint = new URL(rawEntryPoint);
		this.pageList.set(rawEntryPoint, this.createSeed());
		this.captureDir = Path.join(captureDir, sanitizeFileName(this.entryPoint.host), sanitizeFileName(new Date().toLocaleString()));
		setLogLevel(logLevel);
		setLogFunction(onEvent)
	}

	public async crawl() {
		const {entryPoint, pageList, captureDir} = this;

		const scraper = new Scraper(pageList, entryPoint.host);
		await createDir(captureDir);
		const screenShots = await ScreenShots.init(captureDir);
		let i = 0;
		for (const [url, page] of pageList) {
			log(`Checking ${url} (${i} of ${pageList.size})`, 2);
			const loaded = await scraper.checkPage(page);
			if (loaded === true) {
				page.screenshots = await screenShots.capture(url);
			}
			this.writePage(page);
			if (i % 50 === 0) {
				this.writeList();
			}
		}
		await screenShots.close();
		this.writeList();
		bundle(this.captureDir);
		return this.pageList;
	}

	private writeList() {
		fs.writeFileSync(Path.resolve(this.captureDir, "crawl.json"), JSON.stringify(Array.from(this.pageList).map(a => a[0])));
	}

	private createSeed(): IPage {
		return {
			url: this.entryPoint,
			foundOn: 'Entry Point',
		}
	}

	private writePage(page: IPage) {
		fs.writeFileSync(Path.resolve(this.captureDir, sanitizeFileName(page.url.href)), JSON.stringify(page));
	}

}
