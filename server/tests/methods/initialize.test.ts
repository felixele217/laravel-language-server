// server/src/methods/initialize.test.ts
import { describe, it, expect } from "vitest";
import { initialize } from "../../src/methods/initialize";
import { RequestMessage } from "../../src/server";

describe("initialize", () => {
  it("returns correct server capabilities and info", () => {
    const result = initialize();

    expect(result).toEqual({
      capabilities: {
        textDocumentSync: {
          change: 2,
          openClose: true,
        },
        completionProvider: {},
        definitionProvider: {},
      },
      serverInfo: {
        name: "laravel-language-server",
        version: "0.0.1",
      },
    });
  });

  it("maintains expected capability types", () => {
    const result = initialize();

    // Verify specific types and values
    expect(result.capabilities.textDocumentSync).toEqual({
      change: 2,
      openClose: true,
    });
    expect(typeof result.capabilities.completionProvider).toBe("object");
    expect(typeof result.capabilities.definitionProvider).toBe("object");
    expect(result.serverInfo?.name).toBe("laravel-language-server");
    expect(result.serverInfo?.version).toBe("0.0.1");
  });
});
