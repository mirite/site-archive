import Path from "path";
import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer";

import { sanitizeFileName } from "./helpers/files.js";
import { log, logError } from "./logger.js";
import { type ConcreteOptions, type ScreenshotOptions } from "./types/index.js";

/** Handles the screen shot capture */
export default class ScreenShots {
	private readonly requestedFiles: Map<string, string[]>;
	/**
	 * @param captureDir
	 * @param browser
	 * @param page
	 * @param settings
	 */
	private constructor(
		private readonly captureDir: string,
		private readonly browser: Browser,
		private readonly page: Page,
		private readonly settings: ConcreteOptions<ScreenshotOptions>,
	) {
		this.requestedFiles = new Map<string, string[]>();
		this.page.setDefaultTimeout(settings.timeout);
		this.page.on("console", (msg) => {
			log(`Page: ${msg.text()} ${msg.location().url ?? ""}`, 1);
		});

		this.page.on("request", (request) => {
			log(`Media request: ${request.url()}`);
			const url = request.url();
			if (this.requestedFiles.has(url)) {
				this.requestedFiles.get(url)?.push(this.page.url());
			} else {
				this.requestedFiles.set(url, [this.page.url()]);
			}
		});
	}

	/**
	 * @param captureDir
	 * @param settings
	 */
	public static async init(
		captureDir: string,
		settings: ConcreteOptions<ScreenshotOptions>,
	) {
		const browser = await puppeteer.launch({
			headless: true,
		});
		const puppeteerPage = await browser.newPage();

		return new ScreenShots(captureDir, browser, puppeteerPage, settings);
	}

	/** @param url */
	public async capture(url: string) {
		try {
			log(`Waiting for navigation to ${url}`, 1);
			await this.page.goto(url, { waitUntil: "networkidle2" });
			await this.evaluate(url);
			await this.takeScreenShots(url);
		} catch (e: unknown) {
			logError(`navigating to for capture ${url}`, e);
		}
	}

	/** Close the browser. */
	public async close() {
		await this.browser.close();
	}

	public getRequestedFiles() {
		return this.requestedFiles;
	}

	/** @param url */
	private async evaluate(url: string) {
		try {
			log(`Evaluating code on ${url}`, 1);
			const mutableSelectors = [...this.settings.selectorsToRemove];
			await this.page.evaluate(this.evaluateOnPage, mutableSelectors);
		} catch (e) {
			logError(`evaluating code on ${url}`, e);
		}
	}

	/** @param selectorsToHide */
	private async evaluateOnPage(selectorsToHide: string[]) {
		// Scroll down to bottom of page to activate lazy loading images
		document.body.scrollIntoView(false);
		for (const selector of selectorsToHide) {
			const elements = Array.from(document.querySelectorAll(selector));
			for (const element of elements) {
				(element as HTMLElement).parentElement?.removeChild(element);
			}
		}

		const images = document.getElementsByTagName("img");
		console.log(`Waiting for ${images.length} images`);
		// Wait for all remaining lazy loading images to load
		await Promise.all(
			Array.from(images, async (image) => {
				image.loading = "eager";
				if (image.complete) {
					return;
				}

				return new Promise((resolve, reject) => {
					image.addEventListener("load", resolve);
					image.addEventListener("error", reject);
					setTimeout(() => {
						reject(new Error(`Image ${image.src} timed out load.`));
					}, 60000);
				});
			}),
		);
	}

	/**
	 * @param url
	 * @param width
	 * @param height
	 */
	private async takeScreenshot(url: string, width: number, height: number) {
		const path = Path.join(
			this.captureDir,
			sanitizeFileName(url) + `${width}x${height}.png`,
		) as `${string}.png`;
		await this.page.setViewport({ height, width });
		await this.page.screenshot({ fullPage: true, path });
	}

	/** @param url */
	private async takeScreenShots(url: string) {
		try {
			for (const { height, width } of this.settings.screenshotSizes) {
				await this.takeScreenshot(url, width, height);
			}
		} catch (e) {
			logError(`taking screenshots of ${url}`, e);
		}
	}
}
