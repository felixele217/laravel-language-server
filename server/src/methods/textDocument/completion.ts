import { documents } from "../../documents";
import { RequestMessage } from "../../server";
import { wordUnderCursor } from "../../utils/wordUnderCursor";
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

  if (!content) {
    return null;
  }

  const currentWord = wordUnderCursor(params.textDocument.uri, params.position);

  if (!currentWord) return null;

  const items = [];

  if (currentWord.type === "inertia-render") {
    // felix TODO: get page names for completion
    items.push({ label: "customer/Upsert" });
    items.push({ label: "timesheet/TimesheetPage" });
  }

  return {
    isIncomplete: false,
    items: items,
  };
};
