export type SnapshotOptions = {
	ignoreHead?: boolean;
	screenshotsOnly?: boolean;
	screenshotSizes?: ScreenshotSize[];
	htmlOnly?: boolean;
    logLevel?: 1 | 2 | 3,
    onEvent?: (msg: string) => void|Promise<void>
};

type ConcreteSnapshotOptions = {
	[Property in keyof SnapshotOptions]-?: SnapshotOptions[Property];
}

export type ScreenshotSize = {
	width: number;
	height: number;
};
