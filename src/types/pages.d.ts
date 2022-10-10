export type PageList = Map<string, IPage>;

export interface IPage {
	content?: string;
	screenshots?: string[];
	mimeType?: string | null;
	url: URL;
	code?: number;
	foundOn: string;
	visited?: Date;
}
