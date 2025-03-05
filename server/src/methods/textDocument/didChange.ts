import { DocumentUri, documents } from "../../documents";
import { NotificationMessage } from "../../server";
import { Range } from "../../types";

export type TextDocumentContentChangeEvent =
  | {
      range: Range;
      text: string;
    }
  | {
      text: string;
    };

type TextDocumentItem = {
  uri: DocumentUri;
  languageId: string;
  version: number;
  text: string;
};

interface DidChangeTextDocumentParams {
  textDocument: TextDocumentItem;
  contentChanges: TextDocumentContentChangeEvent[];
}

export const didChange = (message: NotificationMessage) => {
  // const params = message.params as DidChangeTextDocumentParams;
  // documents.set(params.textDocument.uri, params.textDocument.text);
};
