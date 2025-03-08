import { documents, DocumentUri } from "../documents";
import { Position, Range } from "../types";

export type Word = {
  text: string;
  range: Range;
  type?: WordType;
};

type WordType = "inertia-render" | "blade-view" | undefined;

export const wordUnderCursor = (
  uri: DocumentUri,
  position: Position,
): Word | null => {
  const document = documents.get(uri);
  if (!document) return null;

  const lines = document.split("\n");
  const line = lines[position.line];

  const wordBoundaries = findWordBoundaries(line, position.character);
  if (!wordBoundaries) return null;

  const { start, end } = wordBoundaries;
  const text = line.slice(start, end);

  return {
    text,
    range: createRange(position.line, start, end),
    type: getWordType(text),
  };
};

interface WordBoundaries {
  start: number;
  end: number;
}

function findWordBoundaries(
  line: string,
  cursorPosition: number,
): WordBoundaries | null {
  const start = line.lastIndexOf(" ", cursorPosition) + 1;
  const end = line.indexOf(" ", cursorPosition);

  return {
    start,
    end: end === -1 ? line.length : end,
  };
}

function createRange(
  lineNumber: number,
  startChar: number,
  endChar: number,
): Range {
  return {
    start: { line: lineNumber, character: startChar },
    end: { line: lineNumber, character: endChar },
  };
}

function getWordType(word: string): WordType {
  if (word?.includes("Inertia::render")) {
    return "inertia-render";
  }

  if (word?.includes("view(")) {
    return "blade-view";
  }

  return undefined;
}
