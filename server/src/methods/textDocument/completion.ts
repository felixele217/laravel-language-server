import { RequestMessage } from "../../server";

type CompletionItem = {
  label: string;
};

export interface CompletionList {
  isIncomplete: boolean;
  items: CompletionItem[];
}

export const completion = (message: RequestMessage): CompletionList => {
  return {
    isIncomplete: false,
    items: [{ label: "simon" }, { label: "lsp" }, { label: "lua" }],
  };
};
