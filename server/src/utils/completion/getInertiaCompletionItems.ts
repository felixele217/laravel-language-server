import * as fs from "fs";
import * as path from "path";
import { CompletionItem } from "../../methods/textDocument/completion";
import { Word } from "../Word";
import { inertiaPagesDir } from "../../config";

export function getInertiaCompletionItems(currentWord: Word): CompletionItem[] {
  const items: CompletionItem[] = [];
  try {
    const searchTerm = extractInertiaSearchTerm(currentWord.text);
    const pagesDir = inertiaPagesDir;

    console.log(fs.existsSync(pagesDir));
    if (fs.existsSync(pagesDir)) {
      return items;
    }

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
