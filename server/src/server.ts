import log from "./log";
import { initialize } from "./methods/initialize";
import { completion } from "./methods/textDocument/completion";
import {
  definition,
  TextDocumentPositionParams,
} from "./methods/textDocument/definition";
import { didOpen } from "./methods/textDocument/didOpen";
import { didChange } from "./methods/textDocument/didChange";
import { didSave } from "./methods/textDocument/didSave";

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
  "textDocument/didSave": didSave,
};

export class MessageParser {
  private buffer: Buffer;

  constructor() {
    this.buffer = Buffer.from([]);
  }

  append(chunk: Buffer | string): void {
    const newChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    this.buffer = Buffer.concat([this.buffer, newChunk]);
    this.processBuffer();
  }

  private processBuffer(): void {
    while (this.buffer.length > 0) {
      const headerEnd = this.buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) return;

      const headerStr = this.buffer.slice(0, headerEnd).toString();
      const match = headerStr.match(/Content-Length: (\d+)/);
      if (!match) {
        // Invalid header, skip to next possible header
        const nextHeader = this.buffer.indexOf("Content-Length:", 1);
        if (nextHeader === -1) {
          this.buffer = Buffer.from([]);
        } else {
          this.buffer = this.buffer.slice(nextHeader);
        }
        return;
      }

      const contentLength = parseInt(match[1], 10);
      const messageStart = headerEnd + 4; // Skip \r\n\r\n
      const messageEnd = messageStart + contentLength;

      if (this.buffer.length < messageEnd) {
        // Not enough data yet
        return;
      }

      try {
        const rawMessage = this.buffer.slice(messageStart, messageEnd);
        const message = JSON.parse(rawMessage.toString());

        log.write(`Processing message: ${message.method}`);

        const method = methodLookup[message.method];
        if (method) {
          respond(message.id, method(message), message);
        }

        // Remove processed message from buffer
        this.buffer = this.buffer.slice(messageEnd);
      } catch (error: any) {
        log.write(`Error processing message: ${error.message}`);
        // Skip this malformed message
        this.buffer = this.buffer.slice(messageEnd);
      }
    }
  }
}

const parser = new MessageParser();

process.stdin.on("data", (chunk) => {
  parser.append(chunk);
});

const respond = (
  id: RequestMessage["id"],
  result: unknown,
  message: RequestMessage,
) => {
  if (!id) return; // Don't respond to notifications (messages without id)

  const response = JSON.stringify({
    jsonrpc: "2.0",
    id: id,
    result: result ?? null, // Ensure result is never undefined
  });

  const messageLength = Buffer.byteLength(response, "utf8");
  const header = `Content-Length: ${messageLength}\r\n\r\n`;
  const fullMessage = header + response;

  process.stdout.write(fullMessage);

  log.write(`-----------------------`);
  log.write(`RESPONSE`);
  log.write(`Full Message: ${response}`);
  log.write(`Method: ${message.method}`);
  log.write(`Response Length: ${messageLength}`);
  log.write(`-----------------------`);
};
