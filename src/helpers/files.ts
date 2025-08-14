import fs from "fs";
import path from "path";
import * as tar from "tar";

import { log } from "../logger.js";

/** @param folder */
export function bundle(folder: string) {
	log("Writing archive", 1);
	const tarOptions = {
		cwd: path.resolve(folder),
		gzip: true,
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

/**
 * @param path
 * @param dirPath
 */
export async function createDir(dirPath: string) {
	await fs.promises.mkdir(dirPath, { recursive: true });
}

/** @param s */
export function sanitizeFileName(s: string) {
	return s.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}
