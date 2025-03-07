import { describe, it, expect, vi, beforeEach } from "vitest";
import { MessageParser } from "../src/server"; // You'll need to export MessageParser
import * as log from "../src/log";

describe("MessageParser", () => {
  let parser: MessageParser;

  beforeEach(() => {
    vi.clearAllMocks();
    parser = new MessageParser();
    // Mock stdout.write to prevent actual writes during tests
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    // Mock log.write
    vi.spyOn(log.default, "write").mockImplementation(() => {});
  });

  it("processes a valid LSP message", () => {
    const message = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {},
    };

    const contentLength = Buffer.byteLength(JSON.stringify(message));
    const input = `Content-Length: ${contentLength}\r\n\r\n${JSON.stringify(message)}`;

    parser.append(input);

    expect(process.stdout.write).toHaveBeenCalled();
    const writeCalls = vi.mocked(process.stdout.write).mock.calls;
    const response = JSON.parse(
      writeCalls[0][0].toString().split("\r\n\r\n")[1],
    );

    expect(response).toHaveProperty("jsonrpc", "2.0");
    expect(response).toHaveProperty("id", 1);
    expect(response).toHaveProperty("result");
  });

  it("handles partial messages", () => {
    const message = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {},
    };

    const contentLength = Buffer.byteLength(JSON.stringify(message));
    const input = `Content-Length: ${contentLength}\r\n\r\n${JSON.stringify(message)}`;

    // Send message in chunks
    parser.append(input.slice(0, 10));
    expect(process.stdout.write).not.toHaveBeenCalled();

    parser.append(input.slice(10));
    expect(process.stdout.write).toHaveBeenCalled();
  });

  it("handles invalid headers", () => {
    const invalidInput = "Invalid-Header: something\r\n\r\nInvalid content";
    parser.append(invalidInput);

    expect(process.stdout.write).not.toHaveBeenCalled();
  });

  it.skip("handles malformed JSON", () => {
    const invalidJson = "Content-Length: 10\r\n\r\n{invalid}";
    parser.append(invalidJson);

    expect(log.default.write).toHaveBeenCalledWith(
      expect.stringContaining("Error processing message"),
    );
  });

  it("ignores notifications (messages without id)", () => {
    const notification = {
      jsonrpc: "2.0",
      method: "textDocument/didOpen",
      params: {},
    };

    const contentLength = Buffer.byteLength(JSON.stringify(notification));
    const input = `Content-Length: ${contentLength}\r\n\r\n${JSON.stringify(notification)}`;

    parser.append(input);
    expect(process.stdout.write).not.toHaveBeenCalled();
  });

  it("processes multiple messages in sequence", () => {
    const message1 = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {},
    };

    const message2 = {
      jsonrpc: "2.0",
      id: 2,
      method: "initialize",
      params: {},
    };

    const input1 = `Content-Length: ${Buffer.byteLength(JSON.stringify(message1))}\r\n\r\n${JSON.stringify(message1)}`;
    const input2 = `Content-Length: ${Buffer.byteLength(JSON.stringify(message2))}\r\n\r\n${JSON.stringify(message2)}`;

    parser.append(input1 + input2);

    expect(process.stdout.write).toHaveBeenCalledTimes(2);
  });

  it("handles unknown methods gracefully", () => {
    const message = {
      jsonrpc: "2.0",
      id: 1,
      method: "unknownMethod",
      params: {},
    };

    const contentLength = Buffer.byteLength(JSON.stringify(message));
    const input = `Content-Length: ${contentLength}\r\n\r\n${JSON.stringify(message)}`;

    parser.append(input);
    expect(process.stdout.write).not.toHaveBeenCalled();
  });
});
