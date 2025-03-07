import { documents, wordUnderCursor } from "../../documents";
import log from "../../log";
import { RequestMessage } from "../../server";
import { TextDocumentPositionParams } from "./definition";

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

  log.write(`content from completion method: ${content?.slice(0, 100)}`);

  if (!content) {
    return null;
  }

  const currentWord = wordUnderCursor(params.textDocument.uri, params.position);
  const inertiaPages = "simon";

  // const currentLine = content.split("\n")[params.position.line];
  // const lineUntilCursor = currentLine.slice(0, params.position.character);
  // const currentPrefix = lineUntilCursor.replace(/.*[\W ](.*?)/, "$1");

  // log.write(`currentLine: ${currentLine}`);
  // log.write(`lineUntilCursor: ${lineUntilCursor}`);
  // log.write(`currentPrefix: ${currentPrefix}`);

  return {
    isIncomplete: false,
    items: [{ label: inertiaPages }, { label: "lsp" }, { label: "lua" }],
  };
};
