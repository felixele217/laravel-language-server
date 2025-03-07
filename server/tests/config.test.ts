import { describe, it, expect, vi, beforeEach } from "vitest";
import * as path from "path";

describe("config", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock("path");

    // Mock process.cwd()
    const mockCwd = vi.spyOn(process, "cwd");
    mockCwd.mockReturnValue("/fake/project/root");
  });

  it("should construct correct inertia pages directory path", async () => {
    vi.mocked(path.join).mockImplementation((...args) => args.join("/"));

    const { inertiaPagesDir } = await import("../src/config");

    expect(inertiaPagesDir).toBe(
      "/fake/project/root/resources/js/inertia-pages",
    );
  });

  it("should use process.cwd() as base directory", async () => {
    vi.mocked(path.join).mockImplementation((...args) => args.join("/"));

    // Import config after mocks
    await import("../src/config");

    // Verify process.cwd was called
    expect(process.cwd).toHaveBeenCalled();
  });
});
