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
    const cwd = process.cwd();
    const pagesDir = path.join(cwd, "resources", "js", "inertia-pages");

    try {
      const files = fs.readdirSync(pagesDir, { recursive: true });
      for (const file of files) {
        if (typeof file === "string" && file.endsWith(".vue")) {
          // Remove .vue extension and convert to completion item
          const pagePath = file.replace(/\.vue$/, "");
          items.push({ label: pagePath });
        }
      }
    } catch (error) {
      console.error("Failed to read Inertia pages directory:", error);
    }
  }

  return {
    isIncomplete: false,
    items: items,
  };
};
