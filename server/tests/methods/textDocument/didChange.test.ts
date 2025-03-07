import { describe, it, expect, beforeEach } from "vitest";
import { didChange } from "../../../src/methods/textDocument/didChange";
import { documents } from "../../../src/documents";
import { NotificationMessage } from "../../../src/server";

describe("didChange", () => {
  beforeEach(() => {
    // Clear documents before each test
    documents.clear();
  });

  it("handles empty content changes", () => {
    const message: NotificationMessage = {
      jsonrpc: "2.0",
      method: "textDocument/didChange",
      params: {
        textDocument: {
          uri: "file:///test.php",
          languageId: "php",
          version: 1,
          text: "original",
        },
        contentChanges: [],
      },
    };

    didChange(message);
    expect(documents.get("file:///test.php")).toBeUndefined();
  });

  it("handles full document updates", () => {
    const message: NotificationMessage = {
      jsonrpc: "2.0",
      method: "textDocument/didChange",
      params: {
        textDocument: {
          uri: "file:///test.php",
          languageId: "php",
          version: 1,
          text: "original",
        },
        contentChanges: [
          {
            text: "new content",
            range: undefined as any,
          },
        ],
      },
    };

    didChange(message);
    expect(documents.get("file:///test.php")).toBe("new content");
  });

  it("handles single line incremental changes", () => {
    // Set initial content
    documents.set("file:///test.php", "hello world");

    const message: NotificationMessage = {
      jsonrpc: "2.0",
      method: "textDocument/didChange",
      params: {
        textDocument: {
          uri: "file:///test.php",
          languageId: "php",
          version: 1,
          text: "",
        },
        contentChanges: [
          {
            range: {
              start: { line: 0, character: 6 },
              end: { line: 0, character: 11 },
            },
            text: "there",
          },
        ],
      },
    };

    didChange(message);
    expect(documents.get("file:///test.php")).toBe("hello there");
  });

  it("handles multiline incremental changes", () => {
    // Set initial content
    documents.set("file:///test.php", "first line\nsecond line\nthird line");

    const message: NotificationMessage = {
      jsonrpc: "2.0",
      method: "textDocument/didChange",
      params: {
        textDocument: {
          uri: "file:///test.php",
          languageId: "php",
          version: 1,
          text: "",
        },
        contentChanges: [
          {
            range: {
              start: { line: 1, character: 0 },
              end: { line: 2, character: 0 },
            },
            text: "new second line\n",
          },
        ],
      },
    };

    didChange(message);
    expect(documents.get("file:///test.php")).toBe(
      "first line\nnew second line\nthird line",
    );
  });

  it("handles multiple incremental changes", () => {
    // Set initial content
    documents.set("file:///test.php", "hello world");

    const message: NotificationMessage = {
      jsonrpc: "2.0",
      method: "textDocument/didChange",
      params: {
        textDocument: {
          uri: "file:///test.php",
          languageId: "php",
          version: 1,
          text: "",
        },
        contentChanges: [
          {
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 11 },
            },
            text: "Hi",
          },
          {
            range: {
              start: { line: 0, character: 3 },
              end: { line: 0, character: 9 },
            },
            text: " there",
          },
        ],
      },
    };

    didChange(message);
    expect(documents.get("file:///test.php")).toBe("Hi there");
  });

  it("handles changes when document is empty", () => {
    const message: NotificationMessage = {
      jsonrpc: "2.0",
      method: "textDocument/didChange",
      params: {
        textDocument: {
          uri: "file:///test.php",
          languageId: "php",
          version: 1,
          text: "",
        },
        contentChanges: [
          {
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 0 },
            },
            text: "new content",
          },
        ],
      },
    };

    didChange(message);
    expect(documents.get("file:///test.php")).toBe("new content");
  });
});
