import log from "../../log";
import { RequestMessage } from "../../server";

type DocumentUri = string;

interface Position {
  line: number;
  character: number;
}

interface Range {
  start: Position;
  end: Position;
}

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

export const definition = (message: RequestMessage): Location => {
  const params = message.params as TextDocumentPositionParams;
  // const uri = params.textDocument.uri;
  log.write("position");

  const uri = getStringAtPosition();

  return {
    uri,
    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
  };
};

function getStringAtPosition() {
  return "file:///Users/felix/code/clockin/resources/js/inertia-pages/Dashboard/DashboardPage.vue";
}
