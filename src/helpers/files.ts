import fs from "fs";
import {log} from "../logger.js";
import tar from "tar";
import path from "path";

export function sanitizeFileName(s: string) {
	return s.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

export async function createDir(path: string) {
	await fs.promises.mkdir(path, {recursive: true});
}

export function bundle(folder: string) {
	log("Writing archive", 1);
	tar.c(
		{
			gzip: true // this will perform the compression too
		},
		[folder]).pipe(fs.createWriteStream(path.resolve(folder, '..', folder + '.tar.gz'))); /* Give the output file name */
	log("Clearing temp files", 1);
	fs.rmdirSync(path.resolve(folder));
}
