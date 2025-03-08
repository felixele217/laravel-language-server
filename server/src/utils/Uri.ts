import * as fs from "fs";
import * as path from "path";
import { Word } from "./Word";
import { inertiaPagesDir } from "../config";
import { getSingleQuoteString } from "./String";

export function getUri(currentWord: Word) {
  if (currentWord.type === "inertia-render") {
    return getInertiaUri(currentWord);
  }

  if (currentWord.type === "blade-view") {
    return getBladeUri(currentWord);
  }
}

function getBladeUri(currentWord: Word) {
  const viewIdentifier = getSingleQuoteString(currentWord);

  if (!viewIdentifier) return;

  if (viewIdentifier.includes("::")) {
    const [module, viewPath] = viewIdentifier.split("::");

    const moduleName = module.charAt(0).toUpperCase() + module.slice(1);

    const viewFilePath = viewPath.split(".").join("/");

    const fullPath = path.join(
      process.cwd(),
      "modules",
      moduleName,
      "Resources",
      "views",
      viewFilePath + ".blade.php"
    );

    if (!fs.existsSync(fullPath)) {
      return;
    }

    return normalizedUri(fullPath);
  }

  const viewFilePath = viewIdentifier.split(".").join("/");

  const fullPath = path.join(
    process.cwd(),
    "resources",
    "views",
    viewFilePath + ".blade.php"
  );
  if (!fs.existsSync(fullPath)) {
    return;
  }

  return normalizedUri(fullPath);
}

function getInertiaUri(currentWord: Word) {
  const pageName = getSingleQuoteString(currentWord);

  if (!pageName) {
    return;
  }

  const filePath = path.join(inertiaPagesDir, `${pageName}.vue`);

  if (!fs.existsSync(filePath)) {
    return;
  }

  return normalizedUri(filePath);
}

function normalizedUri(filePath: string) {
  return `file://${filePath}`.replace(/\\/g, "/");
}
