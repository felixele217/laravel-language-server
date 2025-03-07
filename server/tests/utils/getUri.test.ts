import { describe, it, expect, beforeEach, vi } from "vitest";
import { getUri } from "../../src/utils/getUri";
import * as path from "path";
import * as fs from "fs";
import { WordUnderCursor } from "../../src/utils/wordUnderCursor";

vi.mock("fs");
vi.mock("path");
vi.mock("../config", () => ({
  inertiaPagesDir: "/fake/path",
}));

describe("getUri", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns undefined for null type", () => {
    const word: WordUnderCursor = {
      type: null,
      text: "'Test'",
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 6 },
      },
    };

    expect(getUri(word)).toBeUndefined();
  });

  it("returns file URI when inertia page exists", () => {
    const word: WordUnderCursor = {
      type: "inertia-render",
      text: "'Test/Page'",
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 11 },
      },
    };

    vi.mocked(path.join).mockReturnValue("/fake/path/Test/Page.vue");
    vi.mocked(fs.existsSync).mockReturnValue(true);

    expect(getUri(word)).toBe("file:///fake/path/Test/Page.vue");
  });

  it("returns undefined when page name cannot be extracted", () => {
    const word: WordUnderCursor = {
      type: "inertia-render",
      text: "invalid",
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 7 },
      },
    };

    expect(getUri(word)).toBeUndefined();
  });

  it("returns undefined when file does not exist", () => {
    const word: WordUnderCursor = {
      type: "inertia-render",
      text: "'NonExistent'",
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 13 },
      },
    };

    vi.mocked(fs.existsSync).mockReturnValue(false);

    expect(getUri(word)).toBeUndefined();
  });
});
