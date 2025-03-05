import { DocumentUri, documents } from "../../documents";
import log from "../../log";
import { NotificationMessage } from "../../server";

type TextDocumentItem = {
  uri: DocumentUri;
  languageId: string;
  version: number;
  text: string;
};

interface DidOpenTextDocumentParams {
  textDocument: TextDocumentItem;
}

export const didOpen = (message: NotificationMessage) => {
  const params = message.params as DidOpenTextDocumentParams;

  if (!params.textDocument.uri || !params.textDocument.text) {
    return;
  }

  documents.set(params.textDocument.uri, params.textDocument.text);
};
