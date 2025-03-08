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
  const currentWord = getValidCurrentWord(message);
  if (!currentWord) return null;

  const items = getCompletionItems(currentWord);

  return {
    isIncomplete: false,
    items,
  };
};

function getValidCurrentWord(message: RequestMessage): Word | null {
  const params = message.params as CompletionParams;
  const content = documents.get(params.textDocument.uri);
  if (!content) return null;

  const word = wordUnderCursor(params.textDocument.uri, params.position);
  if (!word) return null;

  log.write("currentWord: " + word.text);
  return word;
}

function getCompletionItems(currentWord: Word): CompletionItem[] {
  if (currentWord.type === "inertia-render") {
    return getInertiaPageNames(currentWord);
  }
  if (currentWord.type === "blade-view") {
    return getBladeViewNames(currentWord);
  }
  return [];
}

function getInertiaPageNames(currentWord: Word): CompletionItem[] {
  const items: CompletionItem[] = [];
  try {
    const searchTerm = extractInertiaSearchTerm(currentWord.text);
    const pagesDir = inertiaPagesDir;

    if (!fs.existsSync(pagesDir)) return items;

    const firstLevelItems = fs.readdirSync(pagesDir, { withFileTypes: true });
    return [
      ...getTopLevelPages(firstLevelItems, searchTerm),
      ...getNestedPages(firstLevelItems, pagesDir, searchTerm),
    ];
  } catch (error) {
    console.error("Failed to read Inertia pages directory:", error);
    return items;
  }
}

function extractInertiaSearchTerm(text: string): string {
  return text.match(/Inertia::render\('([^']+)/)?.[1] || "";
}

function getTopLevelPages(
  items: fs.Dirent[],
  searchTerm: string,
): CompletionItem[] {
  return items
    .filter((item) => item.isFile() && item.name.endsWith(".vue"))
    .map((item) => {
      const pagePath = item.name.replace(/\.vue$/, "");
      if (pagePath.toLowerCase().includes(searchTerm.toLowerCase())) {
        return { label: pagePath };
      }
      return null;
    })
    .filter((item): item is CompletionItem => item !== null);
}

function getNestedPages(
  items: fs.Dirent[],
  pagesDir: string,
  searchTerm: string,
): CompletionItem[] {
  return items
    .filter((item) => item.isDirectory())
    .flatMap((dir) => {
      const nestedPath = path.join(pagesDir, dir.name);
      const nestedItems = fs.readdirSync(nestedPath, { withFileTypes: true });

      return nestedItems
        .filter((item) => item.isFile() && item.name.endsWith(".vue"))
        .map((item) => {
          const pagePath = `${dir.name}/${item.name.replace(/\.vue$/, "")}`;
          if (pagePath.toLowerCase().includes(searchTerm.toLowerCase())) {
            return { label: pagePath };
          }
          return null;
        })
        .filter((item): item is CompletionItem => item !== null);
    });
}

function getBladeViewNames(currentWord: Word): CompletionItem[] {
  const items: CompletionItem[] = [];
  try {
    const modulesDir = path.resolve(process.cwd(), "modules");
    // Check if we're looking for module views
    if (currentWord.text.includes("::")) {
      if (fs.existsSync(modulesDir)) {
        return getAllModuleViews(modulesDir);
      }
      return items;
    }

    // Handle default views from resources/views
    const defaultViewsDir = path.resolve(process.cwd(), "resources", "views");
    if (!fs.existsSync(defaultViewsDir)) return items;

    items.push(...getAllModuleViews(modulesDir));
    items.push(...getDefaultViews(defaultViewsDir));

    return items;
  } catch (error) {
    console.error("Failed to read blade views:", error);
    return items;
  }
}

function getDefaultViews(viewsDir: string): CompletionItem[] {
  const bladeFiles = getAllBladeFiles(viewsDir);

  return bladeFiles.map((file) => {
    const normalizedPath = normalizeViewPath(file, viewsDir);

    return { label: normalizedPath };
  });
}

function getAllModuleViews(modulesDir: string): CompletionItem[] {
  const items: CompletionItem[] = [];
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
    items.push(...createCompletionItems(bladeFiles, viewsPath, moduleDir.name));
  }

  return items;
}

function createCompletionItems(
  files: string[],
  viewsPath: string,
  moduleName: string,
): CompletionItem[] {
  return files.map((file) => {
    const normalizedPath = normalizeViewPath(file, viewsPath);
    const fullViewPath = `${moduleName.toLowerCase()}::${normalizedPath}`;

    return { label: fullViewPath };
  });
}

function normalizeViewPath(file: string, viewsPath: string): string {
  return path
    .relative(viewsPath, file)
    .replace(/\.blade\.php$/, "")
    .split(path.sep)
    .join(".");
}

function getAllBladeFiles(dir: string): string[] {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  return items.reduce<string[]>((results, item) => {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      return results.concat(getAllBladeFiles(fullPath));
    }
    if (item.isFile() && item.name.endsWith(".blade.php")) {
      results.push(fullPath);
    }
    return results;
  }, []);
}
