import {setLogLevel} from "./logger";
import Crawler from "./Crawler";

setLogLevel(1);

const entryPointRaw = process.argv[2];
const crawler = new Crawler(entryPointRaw);
const pageList = await crawler.crawl();
console.log(Array.from(pageList));
export {};
