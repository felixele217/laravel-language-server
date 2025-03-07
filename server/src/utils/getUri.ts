import * as fs from "fs";
import * as path from "path";
import { WordUnderCursor } from "./wordUnderCursor";
import { inertiaPagesDir } from "../config";

export function getUri(currentWord: WordUnderCursor) {
  if (currentWord.type === "inertia-render") {
    return getInertiaUri(currentWord);
  }
}

function getInertiaUri(currentWord: WordUnderCursor) {
  const pageNameMatch = currentWord!.text.match(/'([^']*)'/);

  if (!pageNameMatch || !pageNameMatch.length) {
    return;
  }

  const pageName = getInertiaPageName(currentWord);
  console.log(path.join(inertiaPagesDir, `${pageName}.vue`));
  const filePath = path.join(inertiaPagesDir, `${pageName}.vue`);

  if (!fs.existsSync(filePath)) {
    return;
  }

  return `file://${filePath}`.replace(/\\/g, "/");
}

function getInertiaPageName(currentWord: WordUnderCursor) {
  const pageNameMatch = currentWord!.text.match(/'([^']*)'/);

  if (!pageNameMatch || !pageNameMatch.length) {
    return;
  }

  return pageNameMatch[1];
}
