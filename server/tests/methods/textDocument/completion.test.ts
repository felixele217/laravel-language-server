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

  it("returns completion items for blade view calls", () => {
    // Mock document content
    const uri = "file:///test.php";
    const content = "return view('admin.us";
    documents.set(uri, content);

    // Mock word under cursor
    vi.spyOn(wordUnderCursor, "wordUnderCursor").mockReturnValue({
      text: "view('admin.us",
      range: {
        start: { line: 0, character: 7 },
        end: { line: 0, character: 20 },
      },
      type: "blade-view",
    });

    // Mock filesystem

    vi.mocked(fs.existsSync).mockImplementation(() => true);
    vi.mocked(path.resolve).mockImplementation(
      () => "/Users/user/code/project/modules",
    );

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
      vi.mocked<fs.Dirent>({
        name: "timesheet/index.blade.php",
        isDirectory: () => false,
        isFile: () => true,
      } as fs.Dirent),
    ];

    const mockUserViews = [
      vi.mocked<fs.Dirent>({
        name: "times/index.blade.php",
        isDirectory: () => false,
        isFile: () => true,
      } as fs.Dirent),
    ];

    vi.mocked(fs.existsSync).mockImplementation(() => true);

    vi.mocked(fs.readdirSync).mockImplementation(
      (
        path: fs.PathLike,
        options: fs.ObjectEncodingOptions & {
          withFileTypes: true;
          recursive?: boolean | undefined;
        },
      ): fs.Dirent[] => {
        // Add debug logging

        // Normalize path to prevent recursive matches
        const normalizedPath = path.toString();

        // Use more specific path matching
        if (normalizedPath.endsWith("modules")) {
          return mockModules;
        }
        if (normalizedPath.endsWith("Admin/Resources/views")) {
          return mockAdminViews;
        }
        if (normalizedPath.endsWith("users")) {
          return mockUserViews;
        }

        console.log("No match found for path:", normalizedPath);
        return [];
      },
    );

    vi.mocked(path.relative).mockImplementation((from, to) => {
      // Extract the file name from the full path
      const parts = to.toString().split("/");
      const fileName = parts[parts.length - 1];

      if (fileName === "index.blade.php") {
        return "timesheet/index";
      }
      if (fileName === "users.blade.php") {
        return "users";
      }
      return "";
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
          label: "admin::timesheet.index",
          textEdit: {
            range: {
              start: { line: 0, character: 13 },
              end: { line: 0, character: 20 },
            },
            newText: "admin::timesheet.index'",
          },
        },
      ],
    });
  });
});
