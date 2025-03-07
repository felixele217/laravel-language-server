import { describe, it, expect, beforeEach } from "vitest";
import { didOpen } from "../../../src/methods/textDocument/didOpen";
import { documents } from "../../../src/documents";
import { NotificationMessage } from "../../../src/server";

describe("didOpen", () => {
  beforeEach(() => {
    // Clear documents before each test
    documents.clear();
  });

  it("adds document to collection when valid params provided", () => {
    const message: NotificationMessage = {
      jsonrpc: "2.0",
      method: "textDocument/didOpen",
      params: {
        textDocument: {
          uri: "file:///test.php",
          languageId: "php",
          version: 1,
          text: "test content",
        },
      },
    };

    didOpen(message);

    expect(documents.get("file:///test.php")).toBe("test content");
  });

  it("does nothing when uri is missing", () => {
    const message: NotificationMessage = {
      jsonrpc: "2.0",
      method: "textDocument/didOpen",
      params: {
        textDocument: {
          uri: "",
          languageId: "php",
          version: 1,
          text: "test content",
        },
      },
    };

    didOpen(message);

    expect(documents.size).toBe(0);
  });

  it("does nothing when text is missing", () => {
    const message: NotificationMessage = {
      jsonrpc: "2.0",
      method: "textDocument/didOpen",
      params: {
        textDocument: {
          uri: "file:///test.php",
          languageId: "php",
          version: 1,
          text: "",
        },
      },
    };

    didOpen(message);

    expect(documents.size).toBe(0);
  });

  it("overwrites existing document with same uri", () => {
    // Set initial document
    documents.set("file:///test.php", "initial content");

    const message: NotificationMessage = {
      jsonrpc: "2.0",
      method: "textDocument/didOpen",
      params: {
        textDocument: {
          uri: "file:///test.php",
          languageId: "php",
          version: 1,
          text: "new content",
        },
      },
    };

    didOpen(message);

    expect(documents.get("file:///test.php")).toBe("new content");
    expect(documents.size).toBe(1);
  });
});
