import * as fs from "fs";
import * as path from "path";
import { CompletionItem } from "../../methods/textDocument/completion";
import { Word } from "../Word";
import { log } from "console";

export function getBladeCompletionItems(currentWord: Word): CompletionItem[] {
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

    console.log("hallo from here");
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
  console.log(
    "viewsPath" +
      JSON.stringify(fs.readdirSync(modulesDir, { withFileTypes: true })),
  );

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
  console.log("hallo penis" + dir);
  const items = fs.readdirSync(dir, { withFileTypes: true });
  console.log("hallo nicht");
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
