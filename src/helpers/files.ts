import fs from "fs";

export function sanitizeFileName(s: string) {
	return s.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

export async function createDir(path: string) {
	await fs.promises.mkdir(path, {recursive: true});
}
