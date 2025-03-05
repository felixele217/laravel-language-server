import { TextDocumentIdentifier, documents } from "../../documents";
import { NotificationMessage } from "../../server";

interface DidCloseTextDocumentParams {
  textDocument: TextDocumentIdentifier;
}
export const didClose = (message: NotificationMessage) => {
  // const params = message.params as DidCloseTextDocumentParams;
  // documents.set(params.textDocument.uri, "");
};
