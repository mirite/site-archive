import type { ConcreteOptions, Page, PageList, SnapshotOptions } from "@types";
import Scraper from "./Scraper.js";
import Path from "path";
import { bundle, createDir, sanitizeFileName } from "./helpers/files.js";
import ScreenShots from "./ScreenShots.js";
import { log, setLogFunction, setLogLevel } from "./logger.js";
import fs from "fs";
import { defaultOptions } from "./defaultOptions.js";

export default class Crawler {
  private readonly pageList: PageList;
  private readonly entryPoint: URL;
  private readonly captureDir: string;

  private readonly options: ConcreteOptions<SnapshotOptions>;

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
    const { entryPoint, pageList, captureDir } = this;

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
      }
    }

    await screenShots.close();
    this.writeList();
    bundle(this.captureDir);
    return this.pageList;
  }

  private writeList() {
    fs.writeFileSync(
      Path.resolve(this.captureDir, "crawl.json"),
      JSON.stringify(Array.from(this.pageList).map((a) => a[0])),
    );
  }

  private createSeed(): Page {
    return {
      url: this.entryPoint,
      foundOn: "Entry Point",
    };
  }

  private writePage(page: Page) {
    fs.writeFileSync(
      Path.resolve(this.captureDir, sanitizeFileName(page.url.href)),
      JSON.stringify(page),
    );
  }

  private mergeOptions(
    options: SnapshotOptions,
  ): ConcreteOptions<SnapshotOptions> {
    const concreteOptions: Partial<ConcreteOptions<SnapshotOptions>> = {};
    for (const [key, value] of Object.entries(defaultOptions)) {
      const safeKey = key as keyof SnapshotOptions;
      // @ts-expect-error Because I still need to validate incoming options.
      concreteOptions[safeKey] =
        (typeof options[safeKey] === typeof value && options[safeKey]) ?? value;
    }

    return concreteOptions as ConcreteOptions<SnapshotOptions>;
  }
}
