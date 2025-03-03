import { WordUnderCursor, wordUnderCursor } from "../../documents";
import log from "../../log";
import { RequestMessage } from "../../server";

type DocumentUri = string;

interface Position {
  line: number;
  character: number;
}

interface Range {
  start: Position;
  end: Position;
}

interface Location {
  uri: DocumentUri;
  range: Range;
}
interface TextDocumentIdentifier {
  uri: DocumentUri;
}

export interface TextDocumentPositionParams {
  textDocument: TextDocumentIdentifier;
  position: Position;
}

export const definition = (message: RequestMessage): Location | void => {
  const params = message.params as TextDocumentPositionParams;
  // const uri = params.textDocument.uri;
  log.write("params from definition");
  log.write(params);

  const currentWord = wordUnderCursor(params.textDocument.uri, params.position);

  log.write("currentWord");
  log.write(currentWord);

  if (!currentWord) {
    return;
  }

  const matches = currentWord!.text.match(/'([^']*)'/);
  log.write("matches:");
  log.write(matches);

  if (!matches || !matches.length) {
    return;
  }

  const pageName = matches[1];

  log.write("pageName: ");
  log.write(pageName);

  const uri = getInertiaPage(pageName);

  return {
    uri,
    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
  };
};

function getInertiaPage(pageName: string) {
  return `file:///Users/felix/code/clockin/resources/js/inertia-pages/${pageName}.vue`;
}
