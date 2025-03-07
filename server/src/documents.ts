import { get } from "http";
import log from "./log";
import { Position, Range } from "./types";
import { currentWordIsInertiaRender } from "./utils/inertia/checkCurrentWord";

export type DocumentUri = string;
type DocumentBody = string;

export interface TextDocumentIdentifier {
  uri: DocumentUri;
}

export interface VersionedTextDocumentIdentifier
  extends TextDocumentIdentifier {
  version: number;
}

export interface TextDocumentContentChangeEvent {
  text: string;
}

export const documents = new Map<DocumentUri, DocumentBody>();

export type WordUnderCursor = {
  text: string;
  range: Range;
  type: WordType | null;
};

type WordType = "inertia-render" | null;

export const wordUnderCursor = (
  uri: DocumentUri,
  position: Position,
): WordUnderCursor | null => {
  const document = documents.get(uri);

  if (!document) {
    return null;
  }

  const lines = document.split("\n");
  const line = lines[position.line];

  const start = line.lastIndexOf(" ", position.character) + 1;
  const end = line.indexOf(" ", position.character);

  const text = end === -1 ? line.slice(start) : line.slice(start, end);

  const type = getWordType(text);

  if (end === -1) {
    return {
      text: text,
      range: {
        start: { line: position.line, character: start },
        end: { line: position.line, character: line.length },
      },
      type: type,
    };
  } else {
    return {
      text: text,
      range: {
        start: { line: position.line, character: start },
        end: { line: position.line, character: end },
      },
      type: type,
    };
  }
};

function getWordType(word: string): WordType {
  if (currentWordIsInertiaRender(word)) {
    return "inertia-render";
  }

  return null;
}
