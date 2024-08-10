import fs from "fs";
import path from "path";

import * as tar from "tar";

import { log } from "../logger.js";

/** @param s */
export function sanitizeFileName(s: string) {
	return s.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

/**
 * @param path
 * @param dirPath
 */
export async function createDir(dirPath: string) {
	await fs.promises.mkdir(dirPath, { recursive: true });
}

/** @param folder */
export function bundle(folder: string) {
	log("Writing archive", 1);
	const tarOptions = {
		gzip: true,
		cwd: path.resolve(folder),
	};

	const cleanUp = () => {
		log("Clearing temp files", 1);
		fs.rmSync(folder, { recursive: true });
	};

	const fileList = fs.readdirSync(folder);
	tar
		.c(tarOptions, fileList)
		.pipe(fs.createWriteStream(path.resolve(folder + ".tar.gz")))
		.on("finish", cleanUp);
}
