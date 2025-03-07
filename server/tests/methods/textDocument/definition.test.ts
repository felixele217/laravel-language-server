import { describe, it, expect, vi, beforeEach } from "vitest";
import { definition } from "../../../src/methods/textDocument/definition";
import * as wordUnderCursor from "../../../src/utils/wordUnderCursor";
import * as getUriModule from "../../../src/utils/getUri";
import { RequestMessage } from "../../../src/server";

describe("definition", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    // Mock log
    vi.mock("../../../src/log", () => ({
      default: { write: vi.fn() },
    }));
  });

  it("returns void when no word under cursor is found", () => {
    // Mock wordUnderCursor to return null
    vi.spyOn(wordUnderCursor, "wordUnderCursor").mockReturnValue(null);

    const message: RequestMessage = {
      jsonrpc: "2.0",
      id: 1,
      method: "textDocument/definition",
      params: {
        textDocument: { uri: "file:///test.php" },
        position: { line: 0, character: 0 },
      },
    };

    const result = definition(message);
    expect(result).toBeUndefined();
  });

  it("returns void when word type is null", () => {
    // Mock wordUnderCursor to return word with null type
    vi.spyOn(wordUnderCursor, "wordUnderCursor").mockReturnValue({
      text: "someWord",
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 7 },
      },
      type: null,
    });

    const message: RequestMessage = {
      jsonrpc: "2.0",
      id: 1,
      method: "textDocument/definition",
      params: {
        textDocument: { uri: "file:///test.php" },
        position: { line: 0, character: 0 },
      },
    };

    const result = definition(message);
    expect(result).toBeUndefined();
  });

  it("returns void when getUri returns null", () => {
    // Mock wordUnderCursor
    vi.spyOn(wordUnderCursor, "wordUnderCursor").mockReturnValue({
      text: 'Inertia::render("Dashboard")',
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 25 },
      },
      type: "inertia-render",
    });

    vi.spyOn(getUriModule, "getUri").mockReturnValue(undefined);

    const message: RequestMessage = {
      jsonrpc: "2.0",
      id: 1,
      method: "textDocument/definition",
      params: {
        textDocument: { uri: "file:///test.php" },
        position: { line: 0, character: 0 },
      },
    };

    const result = definition(message);
    expect(result).toBeUndefined();
  });

  it("returns location when valid definition is found", () => {
    // Mock wordUnderCursor
    const mockWord: wordUnderCursor.WordUnderCursor = {
      text: 'Inertia::render("Dashboard")',
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 25 },
      },
      type: "inertia-render",
    };
    vi.spyOn(wordUnderCursor, "wordUnderCursor").mockReturnValue(mockWord);

    // Mock getUri to return a valid URI
    const expectedUri = "file:///path/to/Dashboard.vue";
    vi.spyOn(getUriModule, "getUri").mockReturnValue(expectedUri);

    const message: RequestMessage = {
      jsonrpc: "2.0",
      id: 1,
      method: "textDocument/definition",
      params: {
        textDocument: { uri: "file:///test.php" },
        position: { line: 0, character: 0 },
      },
    };

    const result = definition(message);

    expect(result).toEqual({
      uri: expectedUri,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 },
      },
    });

    // Verify getUri was called with correct word
    expect(getUriModule.getUri).toHaveBeenCalledWith(mockWord);
  });
});
