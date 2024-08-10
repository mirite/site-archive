import path from "path";

import { type SnapshotOptions } from "./types/index.js";

import Crawler from "./index.js";

(async function () {
	const entryPointRaw = process.argv[2];
	const options: SnapshotOptions = {
		logLevel: 2,
		onEvent: console.log,
		ignoreHead: true,
		htmlOnly: true,
		ignoreAnchors: true,
		ignoreQueryString: true,
		screenshotSizes: [
			{
				width: 1920,
				height: 1080,
			},
			{
				width: 320,
				height: 800,
			},
		],
		selectorsToRemove: [".rt-pop-announcement", "#header-container"],
		redirect: "error",
	};
	const crawler = new Crawler(
		entryPointRaw,
		path.resolve(".", "captures"),
		options,
	);
	await crawler.crawl();
})();
