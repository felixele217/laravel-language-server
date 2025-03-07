import { documents, DocumentUri } from "../documents";
import log from "../log";
import { Position, Range } from "../types";

export type WordUnderCursor = {
  text: string;
  range: Range;
  type: WordType;
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
  if (word?.includes("Inertia::render")) {
    return "inertia-render";
  }

  return null;
}
