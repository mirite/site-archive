export type PageList = Map<string, Page>;

export type Page = {
  content?: string;
  screenshots?: string[];
  mimeType?: string;
  url: URL;
  code?: number;
  foundOn: string;
  visited?: Date;
};
