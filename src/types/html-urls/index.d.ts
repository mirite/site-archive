declare module 'html-urls' {
	function a({html: string, url: string}): { value: string, url: string | undefined, uri: string | undefined }[];

	export = a;
}
