import log from "./log";
import { initialize } from "./methods/initialize";
import { completion } from "./methods/textDocument/completion";
import {
  definition,
  TextDocumentPositionParams,
} from "./methods/textDocument/definition";
import { didOpen } from "./methods/textDocument/didOpen";
import { didChange } from "./methods/textDocument/didChange";
import { didClose } from "./methods/textDocument/didClose";

export interface NotificationMessage extends Message {
  method: string;
  params?: unknown[] | object;
}

interface Message {
  jsonrpc: string;
}

export interface RequestMessage extends Message {
  id: number | string;
  method: string;
  params?: unknown[] | TextDocumentPositionParams;
}

type RequestMethod = (message: RequestMessage) => unknown;

const methodLookup: Record<string, RequestMethod> = {
  initialize,
  "textDocument/completion": completion,
  "textDocument/definition": definition,
  "textDocument/didOpen": didOpen,
  "textDocument/didChange": didChange,
  "textDocument/didClose": didClose,
};

let buffer = "";

process.stdin.on("data", (chunk) => {
  buffer += chunk;

  while (buffer.length > 0) {
    const headerMatch = buffer.match(/^Content-Length: (\d+)\r\n\r\n/);
    if (!headerMatch) {
      if (buffer.includes("Content-Length:")) {
        buffer = buffer.slice(buffer.indexOf("Content-Length:"));
      }
      break;
    }

    const contentLength = parseInt(headerMatch[1], 10);
    const headerLength = headerMatch[0].length;
    const totalLength = headerLength + contentLength;

    log.write(
      `Processing message - Header: ${headerLength}, Content: ${contentLength}, Total: ${totalLength}, Have: ${buffer.length}`,
    );

    // If we're within 2 bytes of the expected length, try to process anyway
    // This handles potential length calculation discrepancies
    if (buffer.length < totalLength) {
      if (totalLength - buffer.length <= 2 && buffer.length >= headerLength) {
        // Try to process what we have
        try {
          const rawMessage = buffer.slice(headerLength);
          const message = JSON.parse(rawMessage);

          log.write(
            `Successfully parsed nearly-complete message: ${message.method}`,
          );

          const method = methodLookup[message.method];
          if (method) {
            respond(message.id, method(message), message);
          }

          buffer = ""; // Clear buffer since we processed the message
          break;
        } catch (error: any) {
          log.write(
            `Failed to parse nearly-complete message: ${error.message}`,
          );
          break;
        }
      }
      log.write(
        `Waiting for more data. Have ${buffer.length}, need ${totalLength}`,
      );
      break;
    }

    try {
      const rawMessage = buffer.slice(
        headerLength,
        headerLength + contentLength,
      );
      const message = JSON.parse(rawMessage);

      log.write(`Successfully parsed message: ${message.method}`);

      const method = methodLookup[message.method];

      if (method) {
        respond(message.id, method(message), message);
      }

      buffer = buffer.slice(totalLength);
    } catch (error: any) {
      log.write(`Error processing message: ${error.message}`);
      // Skip this malformed message
      buffer = buffer.slice(totalLength);
    }
  }
});

// Modify the respond function to ensure proper message formatting
const respond = (id: RequestMessage["id"], result: unknown, gc: any) => {
  const response = JSON.stringify({ id, result });
  const messageLength = Buffer.byteLength(response, "utf8");
  const header = `Content-Length: ${messageLength}\r\n\r\n`;

  const fullMessage = header + response;
  process.stdout.write(fullMessage);

  log.write(`Response Message: ${messageLength}`);
  log.write(`Sent response of length ${messageLength}`);
};
