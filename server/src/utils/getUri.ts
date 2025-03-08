import * as fs from "fs";
import * as path from "path";
import { WordUnderCursor } from "./wordUnderCursor";
import { inertiaPagesDir } from "../config";
import log from "../log";

export function getUri(currentWord: WordUnderCursor) {
  if (currentWord.type === "inertia-render") {
    return getInertiaUri(currentWord);
  }

  if (currentWord.type === "blade-view") {
    return getBladeUri(currentWord);
  }
}

// felix TODO: test
function getBladeUri(currentWord: WordUnderCursor) {
  const viewIdentifier = getSingleQuoteString(currentWord);

  if (!viewIdentifier) return;

  // view('components.layout.superadmin-navigation');
  // should return file:///${cwd}/resources/views/components/layout/superadmin-navigation.blade.php
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
      viewFilePath + ".blade.php",
    );

    if (!fs.existsSync(fullPath)) {
      return;
    }

    return `file://${fullPath}`.replace(/\\/g, "/");
  }

  const viewFilePath = viewIdentifier.split(".").join("/");

  const fullPath = path.join(
    process.cwd(),
    "resources",
    "views",
    viewFilePath + ".blade.php",
  );
  if (!fs.existsSync(fullPath)) {
    return;
  }

  return `file://${fullPath}`.replace(/\\/g, "/");
}

function getInertiaUri(currentWord: WordUnderCursor) {
  const pageName = getSingleQuoteString(currentWord);

  if (!pageName) {
    return;
  }

  const filePath = path.join(inertiaPagesDir, `${pageName}.vue`);

  if (!fs.existsSync(filePath)) {
    return;
  }

  return `file://${filePath}`.replace(/\\/g, "/");
}

// TODO: test
function getSingleQuoteString(currentWord: WordUnderCursor) {
  const pageNameMatch = currentWord!.text.match(/'([^']*)'/);

  if (!pageNameMatch || !pageNameMatch.length) {
    return;
  }

  return pageNameMatch[1];
}
