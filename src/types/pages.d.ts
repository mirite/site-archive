export type PageList = Map<string, IPage>;

export interface IPage {
	url: URL;
	code?: number;
	foundOn: string;
	visited?: Date;
}
