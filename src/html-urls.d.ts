declare module "html-urls" {
	function a({ html: string, url: string }): Array<{
		value: string;
		url: string | undefined;
		uri: string | undefined;
	}>;

	export = a;
}

declare module "fstream";
