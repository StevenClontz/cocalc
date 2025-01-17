import { path_split } from "@cocalc/util/misc";
import { constants as fsc } from "fs";
import { access, mkdir } from "fs/promises";
import abspath from "./abspath";

// Make sure that that the directory containing the file indicated by
// the path exists and has restrictive permissions.
export default async function ensureContainingDirectoryExists(
  path: string
): Promise<void> {
  path = abspath(path);
  const containingDirectory = path_split(path).head; // containing path
  if (!containingDirectory) return;

  try {
    await access(containingDirectory, fsc.R_OK | fsc.W_OK);
    // it exists, yeah!
    return;
  } catch (err) {
    // Doesn't exist, so create, via recursion:
    try {
      await mkdir(containingDirectory, { mode: 0o700, recursive: true });
    } catch (err) {
      if (err?.code === "EEXIST") {
        // no problem -- it exists.
        return;
      } else {
        throw err;
      }
    }
  }
}
