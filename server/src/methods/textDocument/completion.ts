import { inertiaPagesDir } from "../../config";
import { documents } from "../../documents";
import log from "../../log";
import { RequestMessage } from "../../server";
import { Range } from "../../types";
import { Word, wordUnderCursor } from "../../utils/Word";
import { TextDocumentPositionParams } from "./definition";
import * as fs from "fs";
import * as path from "path";

type CompletionItem = {
  label: string;
  textEdit?: TextEdit;
};

interface TextEdit {
  range: Range;
  newText: string;
}

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
  modulesDir: try {
    if (!fs.existsSync(modulesDir)) {
      return items;
    }

    // Find the start position and quote type
    const viewMatch = currentWord.text.match(/view\(['"]/) || [];
    const startOffset = viewMatch[0]?.length || 0;
    const quoteType = viewMatch[0]?.slice(-1) || "'"; // Get the quote type (' or ")

    const adjustedRange: Range = {
      start: {
        line: currentWord.range.start.line,
        character: currentWord.range.start.character + startOffset,
      },
      end: currentWord.range.end,
    };

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

      console.log("hallo full view");
      for (const file of bladeFiles) {
        const normalizedPath = path
          .relative(viewsPath, file)
          .replace(/\.blade\.php$/, "")
          .split(path.sep)
          .join(".");

        const fullViewPath = `${moduleDir.name.toLowerCase()}::${normalizedPath}`;
        log.write("fullViewPath: " + fullViewPath);
        console.log(fullViewPath);

        items.push({
          label: fullViewPath,
          textEdit: {
            range: adjustedRange,
            newText: `${fullViewPath}${quoteType}`,
          },
        });
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
