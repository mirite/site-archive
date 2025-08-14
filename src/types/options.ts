export type ConcreteOptions<T> = {
	[Property in keyof T]-?: T[Property];
};

export type ReadonlyOptions<T> = {
	readonly [Property in keyof T]-?: T[Property];
};

export type ScraperOptions = {
	htmlOnly?: boolean;
	htmlTypes?: readonly string[];
	ignoreAnchors?: boolean;
	ignoreHead?: boolean;
	ignoreQueryString?: boolean;
	redirect?: RequestRedirect;
};

export type ScreenshotOptions = {
	screenshotSizes?: readonly ScreenshotSize[];
	selectorsToRemove?: readonly string[];
	timeout?: number;
};

export type ScreenshotSize = {
	height: number;
	width: number;
};

export type SnapshotOptions = ScraperOptions &
	ScreenshotOptions & {
		logLevel?: 1 | 2 | 3;

		onEvent?: (msg: string) => Promise<void> | void;
		screenshotsOnly?: boolean;
	};
