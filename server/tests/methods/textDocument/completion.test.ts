import { describe, it, expect, vi, beforeEach } from "vitest";
import { completion } from "../../../src/methods/textDocument/completion";
import { documents } from "../../../src/documents";
import * as fs from "fs";
import * as path from "path";
import * as wordUnderCursor from "../../../src/utils/Word";
import log from "../../../src/log";

describe("completion", () => {
  beforeEach(() => {
    vi.resetModules();
    documents.clear();
    vi.mock("fs");
    vi.mock("path");
    vi.mock("../../../src/log", () => ({
      default: { write: vi.fn() },
    }));
  });

  it("returns null when document does not exist", () => {
    const message = {
      jsonrpc: "2.0",
      id: 1,
      method: "textDocument/completion",
      params: {
        textDocument: { uri: "file:///test.php" },
        position: { line: 0, character: 0 },
      },
    };

    const result = completion(message);
    expect(result).toBeNull();
  });

  it("returns completion items for Inertia render calls", () => {
    // Mock document content
    const uri = "file:///test.php";
    const content = 'return Inertia::render("Dashboard")';
    documents.set(uri, content);

    // Mock word under cursor
    vi.spyOn(wordUnderCursor, "wordUnderCursor").mockReturnValue({
      text: 'Inertia::render("Da")',
      range: {
        start: { line: 0, character: 7 },
        end: { line: 0, character: 21 },
      },
      type: "inertia-render",
    });

    // Mock filesystem
    const mockFiles = [
      { name: "Dashboard.vue", isFile: () => true, isDirectory: () => false },
      { name: "Admin", isFile: () => false, isDirectory: () => true },
    ];
    const mockSubFiles = [
      {
        name: "DashboardAdmin.vue",
        isFile: () => true,
        isDirectory: () => false,
      },
    ];

    // @ts-ignore
    vi.mocked(fs.readdirSync).mockImplementation((path: string) => {
      if (path.includes("Admin")) {
        return mockSubFiles as any;
      }
      return mockFiles as any;
    });

    vi.mocked(path.join).mockImplementation((...args) => args.join("/"));

    const message = {
      jsonrpc: "2.0",
      id: 1,
      method: "textDocument/completion",
      params: {
        textDocument: { uri },
        position: { line: 0, character: 15 },
      },
    };

    const result = completion(message);

    expect(result).toEqual({
      isIncomplete: false,
      items: [{ label: "Dashboard" }, { label: "Admin/DashboardAdmin" }],
    });
  });

  it("handles filesystem errors gracefully", () => {
    // Mock document content
    const uri = "file:///test.php";
    const content = 'return Inertia::render("Test")';
    documents.set(uri, content);

    // Mock word under cursor
    vi.spyOn(wordUnderCursor, "wordUnderCursor").mockReturnValue({
      text: 'Inertia::render("Test")',
      range: {
        start: { line: 0, character: 7 },
        end: { line: 0, character: 21 },
      },
      type: "inertia-render",
    });

    // Mock filesystem error
    vi.mocked(fs.readdirSync).mockImplementation(() => {
      throw new Error("Access denied");
    });

    const message = {
      jsonrpc: "2.0",
      id: 1,
      method: "textDocument/completion",
      params: {
        textDocument: { uri },
        position: { line: 0, character: 15 },
      },
    };

    const result = completion(message);

    expect(result).toEqual({
      isIncomplete: false,
      items: [],
    });
  });

  it("filters completion items based on search term", () => {
    // Mock document content
    const uri = "file:///test.php";
    const content = 'return Inertia::render("dash")';
    documents.set(uri, content);

    // Mock word under cursor
    vi.spyOn(wordUnderCursor, "wordUnderCursor").mockReturnValue({
      text: "Inertia::render('timesheet')",
      range: {
        start: { line: 0, character: 7 },
        end: { line: 0, character: 21 },
      },
      type: "inertia-render",
    });

    // Mock filesystem
    const mockFiles = [
      {
        name: "timesheet/TimesheetPage.vue",
        isFile: () => true,
        isDirectory: () => false,
      },
      {
        name: "customers/Upsert.vue",
        isFile: () => true,
        isDirectory: () => false,
      },
    ];

    vi.mocked(fs.readdirSync).mockReturnValue(mockFiles as any);

    const message = {
      jsonrpc: "2.0",
      id: 1,
      method: "textDocument/completion",
      params: {
        textDocument: { uri },
        position: { line: 0, character: 15 },
      },
    };

    const result = completion(message);

    expect(result).toEqual({
      isIncomplete: false,
      items: [{ label: "timesheet/TimesheetPage" }],
    });
  });

  describe("blade view calls", () => {
    it("returns completion items for blade view calls", () => {
      // Mock document content and word under cursor
      const uri = "file:///test.php";
      documents.set(uri, "return view('admin.us");

      vi.spyOn(wordUnderCursor, "wordUnderCursor").mockReturnValue({
        text: "view('admin.us",
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
      vi.mocked(path.resolve).mockReturnValue(
        "/Users/user/code/project/modules",
      );

      vi.mocked(fs.readdirSync).mockImplementation(
        (path: fs.PathLike): fs.Dirent[] => {
          const normalizedPath = path.toString();

          if (normalizedPath.endsWith("modules")) return mockModules;
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
        items: [
          {
            label: "admin::users",
            textEdit: {
              range: {
                start: { line: 0, character: 13 },
                end: { line: 0, character: 20 },
              },
              newText: "admin::users'",
            },
          },
          {
            label: "site::timesheet.index",
            textEdit: {
              range: {
                start: { line: 0, character: 13 },
                end: { line: 0, character: 20 },
              },
              newText: "site::timesheet.index'",
            },
          },
        ],
      });
    });

    it("returns empty array when modules directory doesn't exist", () => {
      const uri = "file:///test.php";
      documents.set(uri, "return view('admin.us");

      vi.spyOn(wordUnderCursor, "wordUnderCursor").mockReturnValue({
        text: "view('admin.us",
        range: {
          start: { line: 0, character: 7 },
          end: { line: 0, character: 20 },
        },
        type: "blade-view",
      });

      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = completion({
        jsonrpc: "2.0",
        id: 1,
        method: "textDocument/completion",
        params: {
          textDocument: { uri },
          position: { line: 0, character: 15 },
        },
      });

      expect(result).toEqual({
        isIncomplete: false,
        items: [],
      });
    });
  });
});
