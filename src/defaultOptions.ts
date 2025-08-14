import type { ReadonlyOptions, SnapshotOptions } from "./types/index.js";

export const htmlTypes = [
	"html",
	"htm",
	"xhtml",
	"asp",
	"aspx",
	"shtml",
	"dhtml",
	"php",
	"php5",
	"jsp",
] as const;
export const defaultOptions: ReadonlyOptions<SnapshotOptions> = {
	htmlOnly: false, // Only attempt to follow links that might be HTML documents.
	htmlTypes, // Which file extensions (in addition to no-extension) are considered to be possible HTML links.
	ignoreAnchors: false, // If true, doesn't consider anchors to be part of a URL.
	ignoreHead: false, // If true skip any urls found in the <head> element.
	ignoreQueryString: false, // If true, doesn't consider query strings to be part of a URL.
	logLevel: 2, // The detail level of messages to display. (1, 2, or 3 with 1 being every single message generated).
	onEvent(msg: string) {
		console.log(msg);
	}, // Function that handles messaging from the crawler.
	redirect: "follow", // How to treat HTTP redirects. (https://chromestatus.com/feature/4614142321229824)
	screenshotSizes: [] as const, // An array of {width: number, height: number} for screenshots to take.
	screenshotsOnly: false, // If true doesn't save any page HTML.
	selectorsToRemove: [] as const, // An array of selectors for elements to be removed from the page before taking screenshots.
	timeout: 30000, // How long to wait for a page to finish load before timing out.
} as const;
