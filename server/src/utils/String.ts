import { Word } from "./Word";

export function getSingleQuoteString(currentWord: Word) {
  const pageNameMatch = currentWord!.text.match(/'([^']*)'/);

  if (!pageNameMatch || !pageNameMatch.length) {
    return;
  }

  return pageNameMatch[1];
}
