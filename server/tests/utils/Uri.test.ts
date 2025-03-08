import { describe, it, expect, beforeEach, vi } from "vitest";
import { getUri } from "../../src/utils/Uri";
import * as path from "path";
import * as fs from "fs";
import { Word } from "../../src/utils/wordUnderCursor";

vi.mock("fs");
vi.mock("path");
vi.mock("../config", () => ({
  inertiaPagesDir: "/fake/path",
}));

describe("Uri", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns undefined for null type", () => {
    const word: Word = {
      type: null,
      text: "'Test'",
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 6 },
      },
    };

    expect(getUri(word)).toBeUndefined();
  });

  describe("Inertia views", () => {
    it("returns file URI when inertia page exists", () => {
      const word: Word = {
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
      const word: Word = {
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
      const word: Word = {
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

  describe("Blade views", () => {
    beforeEach(() => {
      vi.spyOn(process, "cwd").mockReturnValue("/fake/project/root");
    });

    it("returns file URI for existing simple view", () => {
      const word: Word = {
        text: "view('dashboard')",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 16 },
        },
        type: "blade-view",
      };

      vi.mocked(path.join).mockImplementation((...args) => args.join("/"));
      vi.mocked(fs.existsSync).mockReturnValue(true);

      expect(getUri(word)).toBe(
        "file:///fake/project/root/resources/views/dashboard.blade.php"
      );
    });

    it("returns file URI for existing nested view", () => {
      const word: Word = {
        text: "view('components.layout.navigation')",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 32 },
        },
        type: "blade-view",
      };

      vi.mocked(path.join).mockImplementation((...args) => args.join("/"));
      vi.mocked(fs.existsSync).mockReturnValue(true);

      expect(getUri(word)).toBe(
        "file:///fake/project/root/resources/views/components/layout/navigation.blade.php"
      );
    });

    it("returns undefined when file does not exist", () => {
      const word: Word = {
        text: "view('non-existent-view')",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 24 },
        },
        type: "blade-view",
      };

      vi.mocked(path.join).mockImplementation((...args) => args.join("/"));
      vi.mocked(fs.existsSync).mockReturnValue(false);

      expect(getUri(word)).toBeUndefined();
    });

    it("handles module views", () => {
      const word: Word = {
        text: "view('stripebilling::admin.index')",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 32 },
        },
        type: "blade-view",
      };

      vi.mocked(path.join).mockImplementation((...args) => args.join("/"));
      vi.mocked(fs.existsSync).mockReturnValue(true);

      expect(getUri(word)).toBe(
        "file:///fake/project/root/modules/Stripebilling/Resources/views/admin/index.blade.php"
      );
    });

    it("handles deeply nested view paths", () => {
      const word: Word = {
        text: "view('admin.users.profile.settings')",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 35 },
        },
        type: "blade-view",
      };

      vi.mocked(path.join).mockImplementation((...args) => args.join("/"));
      vi.mocked(fs.existsSync).mockReturnValue(true);

      expect(getUri(word)).toBe(
        "file:///fake/project/root/resources/views/admin/users/profile/settings.blade.php"
      );
    });

    it("handles windows-style paths", () => {
      const word: Word = {
        text: "view('components.layout')",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 22 },
        },
        type: "blade-view",
      };

      vi.mocked(path.join).mockImplementation((...args) => args.join("\\"));
      vi.mocked(fs.existsSync).mockReturnValue(true);

      expect(getUri(word)).toBe(
        "file:///fake/project/root/resources/views/components/layout.blade.php"
      );
    });
  });
});
