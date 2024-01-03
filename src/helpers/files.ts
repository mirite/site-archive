import fs from "fs";
import { log } from "../logger.js";
import tar from "tar";
import path from "path";

export function sanitizeFileName(s: string) {
  return s.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

export async function createDir(path: string) {
  await fs.promises.mkdir(path, { recursive: true });
}

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
