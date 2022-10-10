import {setLogLevel} from "./logger.js";
import Crawler from "./Crawler.js";

setLogLevel(1);

const entryPointRaw = process.argv[2];
const crawler = new Crawler(entryPointRaw);
await crawler.crawl();
export {};
