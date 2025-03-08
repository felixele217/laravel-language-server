import { describe, expect, it } from "vitest";
import { Word } from "../../src/utils/wordUnderCursor";
import { getSingleQuoteString } from "../../src/utils/String";

describe("getSingleQuoteString", () => {
  it("should extract text between single quotes", () => {
    const word: Word = {
      text: "something 'example text' something",
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 11 },
      },
      type: null,
    };

    expect(getSingleQuoteString(word)).toBe("example text");
  });

  it("should return undefined when no single quotes are found", () => {
    const word: Word = {
      text: "text without quotes",
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 11 },
      },
      type: null,
    };

    expect(getSingleQuoteString(word)).toBeUndefined();
  });

  it("should return undefined for empty quotes", () => {
    const word: Word = {
      text: "''",
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 11 },
      },
      type: null,
    };

    expect(getSingleQuoteString(word)).toBe("");
  });
});
