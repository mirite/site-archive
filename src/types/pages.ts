export type Page = {
	code?: number;
	content?: string;
	foundOn: string;
	mimeType?: string;
	screenshots?: string[];
	url: URL;
	visited?: Date;
};

export type PageList = Map<string, Page>;
