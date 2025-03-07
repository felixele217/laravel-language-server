import { inertiaPagesDir } from "../../config";
import { documents } from "../../documents";
import { RequestMessage } from "../../server";
import { wordUnderCursor } from "../../utils/wordUnderCursor";
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

  const items = [];

  if (currentWord.type === "inertia-render") {
    items.push(...getInertiaPageNames());
  }

  return {
    isIncomplete: false,
    items: items,
  };
};

function getInertiaPageNames() {
  const items = [];
  const pagesDir = inertiaPagesDir;

  try {
    const firstLevelItems = fs.readdirSync(pagesDir, { withFileTypes: true });

    for (const item of firstLevelItems) {
      if (item.isFile() && item.name.endsWith(".vue")) {
        // Add depth 1 .vue files
        const pagePath = item.name.replace(/\.vue$/, "");
        items.push({ label: pagePath });
      } else if (item.isDirectory()) {
        // Get second level items (depth 2)
        const secondLevelPath = path.join(pagesDir, item.name);
        const secondLevelItems = fs.readdirSync(secondLevelPath, {
          withFileTypes: true,
        });

        for (const subItem of secondLevelItems) {
          if (subItem.isFile() && subItem.name.endsWith(".vue")) {
            // Add depth 2 .vue files with their parent directory
            const pagePath = `${item.name}/${subItem.name.replace(/\.vue$/, "")}`;
            items.push({ label: pagePath });
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to read Inertia pages directory:", error);
  }

  return items;
}
