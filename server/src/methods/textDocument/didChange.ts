import { DocumentUri, documents } from "../../documents";
import log from "../../log";
import { NotificationMessage } from "../../server";
import { Range } from "../../types";

export type TextDocumentContentChangeEvent = {
  range: Range; // because in the initialize we set textDocumentSync.change to 2 (incremental)
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
  const params = message.params as DidChangeTextDocumentParams;
  const uri = params.textDocument.uri;

  if (!params.contentChanges.length) return;

  // this happens for textDocumentSync.change = 1 (full)
  if (!params.contentChanges[0].range) {
    documents.set(uri, params.contentChanges[0].text);

    return;
  }

  let content = documents.get(uri) || "";
  for (const change of params.contentChanges) {
    if (change.range) {
      const lines = content.split("\n");
      const start = getOffsetFromPosition(lines, change.range.start);
      const end = getOffsetFromPosition(lines, change.range.end);
      content =
        content.substring(0, start) + change.text + content.substring(end);
    }
  }
  documents.set(uri, content);
};

function getOffsetFromPosition(
  lines: string[],
  position: { line: number; character: number },
): number {
  let offset = 0;
  // Sum up lengths of all previous lines
  for (let i = 0; i < position.line; i++) {
    offset += lines[i].length + 1; // +1 for the newline character
  }
  // Add the characters in the target line
  offset += position.character;
  return offset;
}
