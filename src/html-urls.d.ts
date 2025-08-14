declare module "html-urls" {
	function a({ html: string, url: string }): Array<{
		uri: string | undefined;
		url: string | undefined;
		value: string;
	}>;

	export = a;
}

declare module "fstream";
