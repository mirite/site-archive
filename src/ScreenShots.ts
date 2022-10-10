import type {Browser, Page} from 'puppeteer';
import puppeteer from 'puppeteer';
import Path from 'path';
import {sanitizeFileName} from './helpers/files.js';

type CaptureSettings = {
	resolutions?: Array<[number, number]>;
};

export default class ScreenShots {
	public static async init(captureDir: string, settings?: CaptureSettings) {
		const browser = await puppeteer.launch();
		const puppeteerPage = await browser.newPage();
		return new ScreenShots(captureDir, browser, puppeteerPage, settings);
	}

	private readonly resolutions: Array<[number, number]>;

	private constructor(private readonly captureDir: string, private readonly browser: Browser, private readonly page: Page, private readonly settings?: CaptureSettings) {
		this.resolutions = this.settings?.resolutions ?? [[1920, 1080]];
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
