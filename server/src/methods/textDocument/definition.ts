import log from "../../log";
import { RequestMessage } from "../../server";
import { Position, Range } from "../../types";
import { getUri } from "../../utils/Uri";
import { Word, wordUnderCursor } from "../../utils/Word";

type DocumentUri = string;

interface Location {
  uri: DocumentUri;
  range: Range;
}
export interface TextDocumentIdentifier {
  uri: DocumentUri;
}

export interface TextDocumentPositionParams {
  textDocument: TextDocumentIdentifier;
  position: Position;
}

export const definition = (message: RequestMessage): Location | void => {
  const params = message.params as TextDocumentPositionParams;

  const currentWord = wordUnderCursor(params.textDocument.uri, params.position);
  log.write("currentWord :");
  log.write(currentWord?.text);

  if (!currentWord || currentWord.type === null) return;

  let uri = getUri(currentWord);

  if (!uri) return;

  return {
    uri,
    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
  };
};
