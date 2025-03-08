import { WordUnderCursor } from "./wordUnderCursor";

export function getSingleQuoteString(currentWord: WordUnderCursor) {
  const pageNameMatch = currentWord!.text.match(/'([^']*)'/);

  if (!pageNameMatch || !pageNameMatch.length) {
    return;
  }

  return pageNameMatch[1];
}
