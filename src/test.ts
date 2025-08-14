import path from "path";

import Crawler from "./index.js";
import { type SnapshotOptions } from "./types/index.js";

void (async function () {
	const entryPointRaw = process.argv[2];
	if (!entryPointRaw) {
		console.error("No path provided");
		process.exit(1);
	}
	const options: SnapshotOptions = {
		htmlOnly: true,
		ignoreAnchors: true,
		ignoreHead: true,
		ignoreQueryString: true,
		logLevel: 2,
		onEvent: console.info,
		redirect: "error",
		screenshotSizes: [
			{
				height: 1080,
				width: 1920,
			},
			{
				height: 800,
				width: 320,
			},
		],
		selectorsToRemove: [".rt-pop-announcement", "#header-container"],
	};
	const crawler = new Crawler(
		entryPointRaw,
		path.resolve(".", "captures"),
		options,
	);
	await crawler.crawl();
})();
