import Crawler from "./Crawler";
import path from "path";

const entryPointRaw = process.argv[2];
const crawler = new Crawler(entryPointRaw, path.resolve('.', 'captures'), 1, console.log);
await crawler.crawl();
export {};
