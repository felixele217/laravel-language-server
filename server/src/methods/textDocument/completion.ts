import { inertiaPagesDir } from "../../config";
import { documents } from "../../documents";
import log from "../../log";
import { RequestMessage } from "../../server";
import { WordUnderCursor, wordUnderCursor } from "../../utils/wordUnderCursor";
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

  const items = [];

  if (currentWord.type === "inertia-render") {
    items.push(...getInertiaPageNames(currentWord));
  }

  return {
    isIncomplete: false,
    items: items,
  };
};

function getInertiaPageNames(currentWord: WordUnderCursor) {
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
            const pagePath = `${item.name}/${subItem.name.replace(/\.vue$/, "")}`;
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
