export type SnapshotOptions = {
	ignoreHead: boolean;
	screenshotsOnly: boolean;
	screenshotSizes: ScreenshotSize[];
	htmlOnly: boolean;
};

export type ScreenshotSize = {
	width: number;
	height: number;
};
