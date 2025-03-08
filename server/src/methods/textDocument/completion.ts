import { inertiaPagesDir } from "../../config";
import { documents } from "../../documents";
import log from "../../log";
import { RequestMessage } from "../../server";
import { Range } from "../../types";
import { Word, wordUnderCursor } from "../../utils/Word";
import { TextDocumentPositionParams } from "./definition";
import { getBladeCompletionItems } from "../../utils/completion/getBladeCompletionItems";
import * as fs from "fs";
import * as path from "path";
import { getInertiaCompletionItems } from "../../utils/completion/getInertiaCompletionItems";

export type CompletionItem = {
  label: string;
  textEdit?: TextEdit;
};

interface TextEdit {
  range: Range;
  newText: string;
}

export interface CompletionList {
  isIncomplete: boolean;
  items: CompletionItem[];
}

export interface CompletionParams extends TextDocumentPositionParams {}
export const completion = (message: RequestMessage): CompletionList | null => {
  const currentWord = getValidCurrentWord(message);
  if (!currentWord) return null;

  const items = getCompletionItems(currentWord);

  return {
    isIncomplete: false,
    items,
  };
};

function getValidCurrentWord(message: RequestMessage): Word | null {
  const params = message.params as CompletionParams;
  const content = documents.get(params.textDocument.uri);
  if (!content) return null;

  const word = wordUnderCursor(params.textDocument.uri, params.position);
  if (!word) return null;

  log.write("currentWord: " + word.text);
  return word;
}

function getCompletionItems(currentWord: Word): CompletionItem[] {
  if (currentWord.type === "inertia-render") {
    return getInertiaCompletionItems(currentWord);
  }
  if (currentWord.type === "blade-view") {
    return getBladeCompletionItems(currentWord);
  }
  return [];
}
