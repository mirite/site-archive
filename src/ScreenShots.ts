import puppeteer, {Browser, Page} from "puppeteer";
import Path from "path";
import {sanitizeFileName} from "./helpers/files.js";

interface ICaptureSettings {
	resolutions?: [number, number][]
}

export default class ScreenShots {
	private readonly resolutions: [number, number][];

	private constructor(private captureDir: string, private browser: Browser, private page: Page, private settings?: ICaptureSettings) {
		this.resolutions = this.settings?.resolutions || [[1920, 1080]];
	}

	public static async init(captureDir: string, settings?: ICaptureSettings) {
		const browser = await puppeteer.launch();
		const puppeteerPage = await browser.newPage();
		return new ScreenShots(captureDir, browser, puppeteerPage, settings);
	}

	public async capture(url: string) {
		await this.page.goto(url);
		const paths: string[] = [];
		for (const [width, height] of this.resolutions) {
			const path = Path.join(this.captureDir, sanitizeFileName(url) + `${width}x${height}.png`);
			await this.page.setViewport({width, height});
			await this.page.screenshot({path, fullPage: true});
		}
		return paths;
	}

	public async close() {

		await this.browser.close();
	}
}
