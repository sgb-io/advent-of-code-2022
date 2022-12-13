import { resolve } from "path";
import { promises as fs } from "fs";

export async function parseRawData(dir: string, filename: string) {
  return await fs.readFile(resolve(dir, filename), {
    encoding: "utf-8",
  });
}
