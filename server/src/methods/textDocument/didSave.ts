import {
  DocumentUri,
  TextDocumentIdentifier,
  documents,
} from "../../documents";
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

interface DidSaveTextDocumentParams {
  textDocument: TextDocumentIdentifier;
  text?: string;
}

export const didSave = (message: NotificationMessage) => {
  const params = message.params as DidSaveTextDocumentParams;

  if (!params.text || !params.textDocument.uri) {
    return;
  }

  documents.set(params.textDocument.uri, params.text);
};
