import { WordUnderCursor, wordUnderCursor } from "../../documents";
import { RequestMessage } from "../../server";
import { Position, Range } from "../../types";

type DocumentUri = string;

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

  const currentWord = wordUnderCursor(params.textDocument.uri, params.position);

  if (!currentWord?.text.includes("Inertia::render")) {
    return;
  }

  const uri = getInertiaUri(currentWord);

  if (!uri) {
    return;
  }

  return {
    uri,
    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
  };
};

const getInertiaUri = (currentWord: WordUnderCursor) => {
  // the page name is the string inside the quotes
  // a sample currentWord could be "Inertia::render('hello/world')"
  const pageNameMatch = currentWord!.text.match(/'([^']*)'/);

  if (!pageNameMatch || !pageNameMatch.length) {
    return;
  }

  const pageName = pageNameMatch[1];
  const cwd = process.cwd();

  return `file:///${cwd}/resources/js/inertia-pages/${pageName}.vue`;
};
