import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer";
import Path from "path";
import { sanitizeFileName } from "./helpers/files.js";
import { type ConcreteOptions, type ScreenshotOptions } from "@types";
import { log, logError } from "./logger.js";

export default class ScreenShots {
  public static async init(
    captureDir: string,
    settings: ConcreteOptions<ScreenshotOptions>,
  ) {
    const browser = await puppeteer.launch({
      headless: 'new'
    });
    const puppeteerPage = await browser.newPage();
    puppeteerPage.setDefaultTimeout(settings.timeout);
    puppeteerPage.on("console", (msg) => {
      log(`Page: ${msg.text()} ${msg.location().url ?? ""}`, 1);
    });
    return new ScreenShots(captureDir, browser, puppeteerPage, settings);
  }

  private constructor(
    private readonly captureDir: string,
    private readonly browser: Browser,
    private readonly page: Page,
    private readonly settings: ConcreteOptions<ScreenshotOptions>,
  ) {}

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

  public async close() {
    await this.browser.close();
  }

  private async takeScreenShots(url: string) {
    try {
      for (const { width, height } of this.settings.screenshotSizes) {
        await this.takeScreenshot(url, width, height);
      }
    } catch (e) {
      logError(`taking screenshots of ${url}`, e);
    }
  }

  private async evaluate(url: string) {
    try {
      log(`Evaluating code on ${url}`, 1);
      const mutableSelectors = [...this.settings.selectorsToRemove];
      await this.page.evaluate(this.evaluateOnPage, mutableSelectors);
    } catch (e) {
      logError(`evaluating code on ${url}`, e);
    }
  }

  private async takeScreenshot(url: string, width: number, height: number) {
    const path = Path.join(
      this.captureDir,
      sanitizeFileName(url) + `${width}x${height}.png`,
    );
    await this.page.setViewport({ width, height });
    await this.page.screenshot({ path, fullPage: true });
  }

  private async evaluateOnPage(selectorsToHide: string[]) {
    // Scroll down to bottom of page to activate lazy loading images
    document.body.scrollIntoView(false);
    for (const selector of selectorsToHide) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        (element as HTMLElement).parentElement?.removeChild(element);
      }
    }

    const images = document.getElementsByTagName("img");
    console.log(`Waiting for ${images.length} images`);
    // Wait for all remaining lazy loading images to load
    await Promise.all(
      Array.from(images, async (image) => {
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
}
