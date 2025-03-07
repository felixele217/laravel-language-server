import { WordUnderCursor, wordUnderCursor } from "../../documents";
import log from "../../log";
import { RequestMessage } from "../../server";
import { Position, Range } from "../../types";
import * as fs from "fs";
import * as path from "path";
import { currentWordIsInertiaRender } from "../../utils/inertia/checkCurrentWord";

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

  const currentWord = currentWordIsInertiaRender(
    params.textDocument.uri,
    params.position,
  );

  if (!currentWord) {
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

export const getInertiaPageName = (currentWord: WordUnderCursor) => {
  const pageNameMatch = currentWord!.text.match(/'([^']*)'/);

  if (!pageNameMatch || !pageNameMatch.length) {
    return;
  }

  return pageNameMatch[1];
};

const getInertiaUri = (currentWord: WordUnderCursor) => {
  // sample word under cursor: Inertia::render('pages/Welcome')
  const pageNameMatch = currentWord!.text.match(/'([^']*)'/);

  if (!pageNameMatch || !pageNameMatch.length) {
    return;
  }

  const pageName = getInertiaPageName(currentWord);
  const cwd = process.cwd();
  const filePath = path.join(
    cwd,
    "resources",
    "js",
    "inertia-pages",
    `${pageName}.vue`,
  );

  if (!fs.existsSync(filePath)) {
    return;
  }

  return `file://${filePath}`.replace(/\\/g, "/");
};
