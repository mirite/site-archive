import puppeteer, {Browser, Page} from "puppeteer";
import Path from "path";
import {sanitizeFileName} from "./helpers/files";

interface ICaptureSettings {
	resolutions?: [number, number][]
}

export default class ScreenShots {

	private constructor(private captureDir: string, private browser: Browser, private page: Page, private settings?: ICaptureSettings) {
	}

	public static async init(captureDir: string, settings?: ICaptureSettings) {
		const browser = await puppeteer.launch();
		const puppeteerPage = await browser.newPage();
		return new ScreenShots(captureDir, browser, puppeteerPage, settings);
	}

	public async capture(url: string) {
		const path = Path.join(this.captureDir, sanitizeFileName(url) + '.png');
		await this.page.goto(url);
		await this.page.screenshot({path});
	}

	public async close() {

		await this.browser.close();
	}
}
