import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as wordUnderCursor from "../../../src/utils/Word";
import { getInertiaCompletionItems } from "../../../src/utils/completion/getInertiaCompletionItems";
import { documents } from "../../../src/documents";
import { completion } from "../../../src/methods/textDocument/completion";
import log from "../../../src/log";

describe("getInertiaCompletionItems", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    vi.mock("fs");
    vi.mock("path");
    vi.mock("../../../src/config", () => ({
      inertiaPagesDir: "/project/resources/js/Pages",
    }));
    vi.mock("../../../src/log", () => ({
      default: { write: vi.fn() },
    }));
    documents.clear();
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
      vi.mocked<fs.Dirent>({
        name: "Dashboard.vue",
        isFile: () => true,
        isDirectory: () => false,
      } as fs.Dirent),
      vi.mocked<fs.Dirent>({
        name: "Admin",
        isFile: () => false,
        isDirectory: () => true,
      } as fs.Dirent),
    ];

    const mockSubFiles = [
      vi.mocked<fs.Dirent>({
        name: "DashboardAdmin.vue",
        isFile: () => true,
        isDirectory: () => false,
      } as fs.Dirent),
    ];
    // console.log("hallo welt");

    vi.mocked(fs.readdirSync).mockImplementation(
      (path: fs.PathLike, options?: any): fs.Dirent[] => {
        const normalizedPath = path.toString();

        if (normalizedPath.includes("Admin")) {
          return mockSubFiles;
        }
        return mockFiles;
      },
    );

    vi.mocked(fs.existsSync).mockReturnValue(false);
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
});
