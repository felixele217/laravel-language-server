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

function getBladeUri(currentWord: WordUnderCursor) {
  const viewIdentifier = getSingleQuoteString(currentWord);
  // "stripebilling::modex.index" => "modules/StripeBilling/Resources/views/modex/index.blade.php"
  // "stripebilling::mode.test.index" => "modules/StripeBilling/Resources/views/modex//test/index.blade.php"
  // can you do that?

  if (viewIdentifier && viewIdentifier.includes("::")) {
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
}

function getInertiaUri(currentWord: WordUnderCursor) {
  const pageName = getSingleQuoteString(currentWord);
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
