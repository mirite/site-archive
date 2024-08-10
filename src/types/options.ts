export type SnapshotOptions = {
	screenshotsOnly?: boolean;

	logLevel?: 1 | 2 | 3;
	onEvent?: (msg: string) => void | Promise<void>;
} & ScraperOptions &
	ScreenshotOptions;

export type ScraperOptions = {
	ignoreHead?: boolean;
	htmlOnly?: boolean;
	htmlTypes?: readonly string[];
	ignoreAnchors?: boolean;
	ignoreQueryString?: boolean;
	redirect?: RequestRedirect;
};

export type ScreenshotOptions = {
	screenshotSizes?: readonly ScreenshotSize[];
	selectorsToRemove?: readonly string[];
	timeout?: number;
};

export type ConcreteOptions<T> = {
	[Property in keyof T]-?: T[Property];
};

export type ScreenshotSize = {
	width: number;
	height: number;
};

export type ReadonlyOptions<T> = {
	readonly [Property in keyof T]-?: T[Property];
};
