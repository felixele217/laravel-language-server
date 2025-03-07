import { documents, wordUnderCursor } from "../../documents";
import log from "../../log";
import { RequestMessage } from "../../server";
import { currentWordIsInertiaRender } from "../../utils/inertia/checkCurrentWord";
import { getInertiaPageName, TextDocumentPositionParams } from "./definition";

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

  const inertiaRenderWord = currentWordIsInertiaRender(
    params.textDocument.uri,
    params.position,
  );

  log.write("inertiaRenderWord: " + inertiaRenderWord);

  if (!inertiaRenderWord) return null;

  const items = [];

  items.push({ label: "hallo es geht" });

  return {
    isIncomplete: false,
    items: items,
  };
};
