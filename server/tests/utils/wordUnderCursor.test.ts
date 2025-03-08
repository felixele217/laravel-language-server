import { describe, it, expect, beforeEach } from "vitest";
import { documents } from "../../src/documents";
import { Position } from "../../src/types";
import { wordUnderCursor } from "../../src/utils/wordUnderCursor";

describe("wordUnderCursor", () => {
  const mockUri = "file:///test.php";

  beforeEach(() => {
    // Clear documents before each test
    documents.clear();
  });

  it("returns null when document does not exist", () => {
    const position: Position = { line: 0, character: 0 };
    const result = wordUnderCursor(mockUri, position);
    expect(result).toBeNull();
  });

  it("finds word in middle of line", () => {
    const content = "two 'seperatedby' 'whitespace'";
    documents.set(mockUri, content);

    const position: Position = { line: 0, character: 15 };
    const result = wordUnderCursor(mockUri, position);

    expect(result).toEqual({
      text: "'seperatedby'",
      range: {
        start: { line: 0, character: 4 },
        end: { line: 0, character: 17 },
      },
      type: null,
    });
  });

  it("finds word at end of line", () => {
    const content = "return Inertia::render";
    documents.set(mockUri, content);

    const position: Position = { line: 0, character: 15 };
    const result = wordUnderCursor(mockUri, position);

    expect(result).toEqual({
      text: "Inertia::render",
      range: {
        start: { line: 0, character: 7 },
        end: { line: 0, character: 22 },
      },
      type: "inertia-render",
    });
  });

  it("view(' words are of type blade-view", () => {
    const content = "return view('site::dashboard', ";
    documents.set(mockUri, content);

    const position: Position = { line: 0, character: 15 };
    const result = wordUnderCursor(mockUri, position);

    expect(result).toEqual({
      text: "view('site::dashboard',",
      range: {
        start: { line: 0, character: 7 },
        end: { line: 0, character: 30 },
      },
      type: "blade-view",
    });
  });

  it("returns null type for non-Inertia words", () => {
    const content = "return something";
    documents.set(mockUri, content);

    const position: Position = { line: 0, character: 8 };
    const result = wordUnderCursor(mockUri, position);

    expect(result).toEqual({
      text: "something",
      range: {
        start: { line: 0, character: 7 },
        end: { line: 0, character: 16 },
      },
      type: null,
    });
  });

  it("handles multiline documents", () => {
    const content = "first line\nreturn Inertia::render\nthird line";
    documents.set(mockUri, content);

    const position: Position = { line: 1, character: 15 };
    const result = wordUnderCursor(mockUri, position);

    expect(result).toEqual({
      text: "Inertia::render",
      range: {
        start: { line: 1, character: 7 },
        end: { line: 1, character: 22 },
      },
      type: "inertia-render",
    });
  });
});
