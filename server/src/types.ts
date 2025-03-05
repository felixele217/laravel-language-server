import { TextDocumentIdentifier } from "./documents";

export interface Position {
  line: number;
  character: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface WillSaveTextDocumentParams {
  textDocument: TextDocumentIdentifier;
  reason: TextDocumentSaveReason;
}

export type TextDocumentSaveReason = 1 | 2 | 3;
