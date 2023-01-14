export type SnapshotOptions = {

	screenshotsOnly?: boolean;

	logLevel?: 1 | 2 | 3;
	onEvent?: (msg: string) => void | Promise<void>;
} & ScraperOptions & ScreenshotOptions;

export type ScraperOptions = {
	ignoreHead?: boolean;
	htmlOnly?: boolean;
	htmlTypes?: string[];
	ignoreAnchors?: boolean;
	ignoreQueryString?: boolean;
	redirect?: RequestRedirect;
};

export type ScreenshotOptions = {
	screenshotSizes?: ScreenshotSize[];
	selectorsToRemove?: string[];
	timeout?: number;
};

type ConcreteOptions<T> = {
	[Property in keyof T]-?: T[Property];
};

export type ScreenshotSize = {
	width: number;
	height: number;
};
