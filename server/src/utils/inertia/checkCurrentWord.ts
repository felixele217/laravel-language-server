import {
  DocumentUri,
  TextDocumentIdentifier,
  wordUnderCursor,
} from "../../documents";
import { Position } from "../../types";

export function currentWordIsInertiaRender(
  textDocumentUri: DocumentUri,
  position: Position,
) {
  const currentWord = wordUnderCursor(textDocumentUri, position);

  if (currentWord?.text.includes("Inertia::render")) {
    return currentWord;
  }

  return null;
}
