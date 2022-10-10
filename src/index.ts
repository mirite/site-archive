import {setLogLevel} from "./logger.js";
import Crawler from "./Crawler.js";

setLogLevel(1);

const entryPointRaw = process.argv[2];
const crawler = new Crawler(entryPointRaw);
const pageList = await crawler.crawl();
console.log(Array.from(pageList));
export {};
