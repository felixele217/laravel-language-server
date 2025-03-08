import { inertiaPagesDir } from "../../config";
import { documents } from "../../documents";
import log from "../../log";
import { RequestMessage } from "../../server";
import { Word, wordUnderCursor } from "../../utils/Word";
import { TextDocumentPositionParams } from "./definition";
import * as fs from "fs";
import * as path from "path";

type CompletionItem = {
  label: string;
};

export interface CompletionList {
  isIncomplete: boolean;
  items: CompletionItem[];
}

export interface CompletionParams extends TextDocumentPositionParams {}

export const completion = (message: RequestMessage): CompletionList | null => {
  const params = message.params as CompletionParams;
  const content = documents.get(params.textDocument.uri);

  if (!content) {
    return null;
  }

  const currentWord = wordUnderCursor(params.textDocument.uri, params.position);

  if (!currentWord) return null;
  log.write("currentWord: " + currentWord.text);

  const items: CompletionItem[] = [];

  if (currentWord.type === "inertia-render") {
    items.push(...getInertiaPageNames(currentWord));
  }

  if (currentWord.type === "blade-view") {
    items.push(...getBladeViewNames(currentWord));
  }

  return {
    isIncomplete: false,
    items: items,
  };
};

function getBladeViewNames(currentWord: Word) {
  const items: CompletionItem[] = [];
  const modulesDir = path.resolve(process.cwd(), "modules");

  try {
    const searchTerm = currentWord.text.match(/view\(['"]([^'"]+)/)?.[1] || "";

    if (!fs.existsSync(modulesDir)) {
      return items;
    }

    const modules = fs
      .readdirSync(modulesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory());

    for (const moduleDir of modules) {
      const viewsPath = path.join(
        modulesDir,
        moduleDir.name,
        "Resources",
        "views",
      );

      if (!fs.existsSync(viewsPath)) continue;

      const bladeFiles = getAllBladeFiles(viewsPath);

      for (const file of bladeFiles) {
        // Normalize the path to prevent double module names
        const normalizedPath = path
          .relative(viewsPath, file)
          .replace(/\.blade\.php$/, "")
          .split(path.sep)
          .join(".");

        const fullViewPath = `${moduleDir.name.toLowerCase()}::${normalizedPath}`;

        if (fullViewPath.toLowerCase().includes(searchTerm.toLowerCase())) {
          items.push({
            label: fullViewPath,
            // kind: CompletionItemKind.File,
            // detail: `Blade View: ${fullViewPath}`,
          });
        }
      }
    }
  } catch (error) {
    console.error("Failed to read blade views:", error);
  }

  return items;
}

function getAllBladeFiles(dir: string): string[] {
  let results: string[] = [];

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      results = results.concat(getAllBladeFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith(".blade.php")) {
      results.push(fullPath);
    }
  }

  return results;
}

function getInertiaPageNames(currentWord: Word) {
  const items = [];
  const pagesDir = inertiaPagesDir;

  try {
    const searchTerm =
      currentWord.text.match(/Inertia::render\('([^']+)/)?.[1] || "";

    const firstLevelItems = fs.readdirSync(pagesDir, { withFileTypes: true });

    for (const item of firstLevelItems) {
      if (item.isFile() && item.name.endsWith(".vue")) {
        const pagePath = item.name.replace(/\.vue$/, "");
        if (pagePath.toLowerCase().includes(searchTerm.toLowerCase())) {
          items.push({ label: pagePath });
        }
      } else if (item.isDirectory()) {
        const secondLevelPath = path.join(pagesDir, item.name);
        const secondLevelItems = fs.readdirSync(secondLevelPath, {
          withFileTypes: true,
        });

        for (const subItem of secondLevelItems) {
          if (subItem.isFile() && subItem.name.endsWith(".vue")) {
            const pagePath = `${item.name}/${subItem.name.replace(
              /\.vue$/,
              "",
            )}`;
            if (pagePath.toLowerCase().includes(searchTerm.toLowerCase())) {
              items.push({ label: pagePath });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to read Inertia pages directory:", error);
  }

  return items;
}
