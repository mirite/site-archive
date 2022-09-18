import {IPage, PageList} from "@types";
import Scraper from "./Scraper";
import Path from "path";
import {createDir, sanitizeFileName} from "./helpers/files";
import ScreenShots from "./screenShots";
import {log} from "./logger";

export default class Crawler {
	private readonly pageList: PageList;
	private readonly entryPoint: URL;
	private captureDir: string;

	public constructor(rawEntryPoint: string) {
		this.pageList = new Map<string, IPage>();
		this.entryPoint = new URL(rawEntryPoint);
		this.pageList.set(rawEntryPoint, this.createSeed());
		this.captureDir = Path.join('.', 'captures', sanitizeFileName(this.entryPoint.host), sanitizeFileName(new Date().toLocaleString()));
	}

	public async crawl() {
		const {entryPoint, pageList, captureDir} = this;

		const scraper = new Scraper(pageList, entryPoint.host);
		await createDir(captureDir);
		const screenShots = await ScreenShots.init(captureDir);
		for (const [url, page] of pageList) {
			log(`Checking ${url}`, 2);
			await screenShots.capture(url);
			await scraper.checkPage(page);
		}
		await screenShots.close();
		return this.pageList;
	}

	private createSeed(): IPage {
		return {
			url: this.entryPoint,
			foundOn: 'Entry Point',
		}
	}

}
