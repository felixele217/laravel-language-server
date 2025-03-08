import { describe, it, expect, vi, beforeEach } from "vitest";
import { completion } from "../../../src/methods/textDocument/completion";
import { documents } from "../../../src/documents";
import * as fs from "fs";
import * as path from "path";
import * as wordUnderCursor from "../../../src/utils/Word";
import log from "../../../src/log";
import { getBladeCompletionItems } from "../../../src/utils/completion/getBladeCompletionItems";

describe("blade view calls", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    vi.mock("fs");
    vi.mock("path");
    vi.mock("../../../src/log", () => ({
      default: { write: vi.fn() },
    }));
    documents.clear();
  });

  it("returns completion items for blade view calls", () => {
    // Mock document content and word under cursor
    const uri = "file:///test.php";
    documents.set(uri, "return view('admin::us"); // Added :: to indicate module view

    vi.spyOn(wordUnderCursor, "wordUnderCursor").mockReturnValue({
      text: "view('admin::us", // Added :: to indicate module view
      range: {
        start: { line: 0, character: 7 },
        end: { line: 0, character: 20 },
      },
      type: "blade-view",
    });

    // Mock filesystem structure
    const mockModules = [
      vi.mocked<fs.Dirent>({
        name: "Admin",
        isDirectory: () => true,
      } as fs.Dirent),
      vi.mocked<fs.Dirent>({
        name: "Site",
        isDirectory: () => true,
      } as fs.Dirent),
    ];

    const mockAdminViews = [
      vi.mocked<fs.Dirent>({
        name: "users.blade.php",
        isDirectory: () => false,
        isFile: () => true,
      } as fs.Dirent),
    ];

    const mockSiteViews = [
      vi.mocked<fs.Dirent>({
        name: "timesheet/index.blade.php",
        isDirectory: () => false,
        isFile: () => true,
      } as fs.Dirent),
    ];

    // Mock filesystem operations
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(path.resolve).mockImplementation((...args) => {
      if (args.includes("modules")) {
        return "/Users/user/code/project/Modules";
      }
      return "/Users/user/code/project/resources/views";
    });

    vi.mocked(fs.readdirSync).mockImplementation(
      (path: fs.PathLike): fs.Dirent[] => {
        const normalizedPath = path.toString();
        console.log("normalizedPath", normalizedPath);

        if (normalizedPath.endsWith("Modules")) return mockModules;
        if (normalizedPath.endsWith("Admin/Resources/views"))
          return mockAdminViews;
        if (normalizedPath.endsWith("Site/Resources/views"))
          return mockSiteViews;

        return [];
      },
    );

    vi.mocked(path.relative).mockImplementation((from, to) => {
      const fileName = to.toString().split("/").pop();

      if (fileName === "index.blade.php") return "timesheet/index";
      if (fileName === "users.blade.php") return "users";
      return "";
    });

    // Test completion
    const result = completion({
      jsonrpc: "2.0",
      id: 1,
      method: "textDocument/completion",
      params: {
        textDocument: { uri },
        position: { line: 0, character: 15 },
      },
    });

    // Verify results
    expect(result).toEqual({
      isIncomplete: false,
      items: [{ label: "admin::users" }, { label: "site::timesheet.index" }],
    });
  });
});
