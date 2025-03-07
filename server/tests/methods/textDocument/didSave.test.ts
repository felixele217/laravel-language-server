import { describe, it, expect, beforeEach } from "vitest";
import { didSave } from "../../../src/methods/textDocument/didSave";
import { documents } from "../../../src/documents";
import { NotificationMessage } from "../../../src/server";

describe("didSave", () => {
  beforeEach(() => {
    // Clear documents before each test
    documents.clear();
  });

  it("updates document content when valid params provided", () => {
    const message: NotificationMessage = {
      jsonrpc: "2.0",
      method: "textDocument/didSave",
      params: {
        textDocument: {
          uri: "file:///test.php",
        },
        text: "saved content",
      },
    };

    didSave(message);

    expect(documents.get("file:///test.php")).toBe("saved content");
  });

  it("does nothing when text is missing", () => {
    // Set initial content
    documents.set("file:///test.php", "initial content");

    const message: NotificationMessage = {
      jsonrpc: "2.0",
      method: "textDocument/didSave",
      params: {
        textDocument: {
          uri: "file:///test.php",
        },
      },
    };

    didSave(message);

    // Content should remain unchanged
    expect(documents.get("file:///test.php")).toBe("initial content");
  });

  it("does nothing when uri is missing", () => {
    const message: NotificationMessage = {
      jsonrpc: "2.0",
      method: "textDocument/didSave",
      params: {
        textDocument: {
          uri: "",
        },
        text: "saved content",
      },
    };

    didSave(message);

    expect(documents.size).toBe(0);
  });

  it("overwrites existing document content", () => {
    // Set initial content
    documents.set("file:///test.php", "initial content");

    const message: NotificationMessage = {
      jsonrpc: "2.0",
      method: "textDocument/didSave",
      params: {
        textDocument: {
          uri: "file:///test.php",
        },
        text: "new saved content",
      },
    };

    didSave(message);

    expect(documents.get("file:///test.php")).toBe("new saved content");
    expect(documents.size).toBe(1);
  });
});
