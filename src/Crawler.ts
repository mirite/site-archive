import fs from "fs";
import Path from "path";

import { defaultOptions } from "./defaultOptions.js";
import { bundle, createDir, sanitizeFileName } from "./helpers/files.js";
import { log, setLogFunction, setLogLevel } from "./logger.js";
import Scraper from "./Scraper.js";
import ScreenShots from "./ScreenShots.js";
import type {
	ConcreteOptions,
	Page,
	PageList,
	SnapshotOptions,
} from "./types/index.js";

export default class Crawler {
	private readonly captureDir: string;
	private readonly entryPoint: URL;
	private readonly options: ConcreteOptions<SnapshotOptions>;

	private readonly pageList: PageList;

	/**
	 * @param rawEntryPoint
	 * @param captureDir
	 * @param options
	 */
	public constructor(
		rawEntryPoint: string,
		captureDir: string,
		options: SnapshotOptions = {},
	) {
		this.options = this.mergeOptions(options);
		this.pageList = new Map<string, Page>();
		this.entryPoint = new URL(rawEntryPoint);
		this.pageList.set(rawEntryPoint, this.createSeed());
		this.captureDir = Path.join(
			captureDir,
			sanitizeFileName(this.entryPoint.host),
			sanitizeFileName(new Date().toLocaleString()),
		);
		const { logLevel, onEvent } = this.options;
		setLogLevel(logLevel);
		setLogFunction(onEvent);
	}

	public async crawl() {
		const { captureDir, entryPoint, pageList } = this;

		const scraper = new Scraper(pageList, entryPoint.host, this.options);
		await createDir(captureDir);
		const screenShots = await ScreenShots.init(captureDir, this.options);
		let i = 0;
		for (const [url, page] of pageList) {
			log(`Checking ${url} (${i} of ${pageList.size})`, 2);
			const loaded = await scraper.checkPage(page);
			if (loaded === true) {
				await screenShots.capture(url);
			}

			if (!this.options.screenshotsOnly) {
				this.writePage(page);
			}

			if (i++ % 50 === 0) {
				this.writeList();
				this.writeAssetLog(screenShots.getRequestedFiles());
			}
		}

		await screenShots.close();
		this.writeList();
		this.writeAssetLog(screenShots.getRequestedFiles());
		bundle(this.captureDir);
		return this.pageList;
	}

	private createSeed(): Page {
		return {
			foundOn: "Entry Point",
			url: this.entryPoint,
		};
	}

	/** @param options */
	private mergeOptions(
		options: SnapshotOptions,
	): ConcreteOptions<SnapshotOptions> {
		return { ...defaultOptions, ...options };
	}

	/** @param requestedFiles */
	private writeAssetLog(requestedFiles: Map<string, string[]>) {
		fs.writeFileSync(
			Path.resolve(this.captureDir, "assetLog.json"),
			JSON.stringify(Array.from(requestedFiles)),
		);
	}

	private writeList() {
		fs.writeFileSync(
			Path.resolve(this.captureDir, "crawl.json"),
			JSON.stringify(Array.from(this.pageList).map((a) => a[0])),
		);
	}

	/** @param page */
	private writePage(page: Page) {
		fs.writeFileSync(
			Path.resolve(this.captureDir, sanitizeFileName(page.url.href)),
			JSON.stringify(page),
		);
	}
}
